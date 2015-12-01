var Promise = require('bluebird');

module.exports = function(Purchaseorder) {
  Purchaseorder.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.subscriberId = ctx.req.accessToken.userId;
    next();
  });

  Purchaseorder.observe('before delete', function(ctx, next) {
    // Deletes all purchase order rows for the orders about to be deleted

    var app = require('../../server/server');
    var PurchaseOrderRow = app.models.Purchaseorderrow;

    var findPurchaseOrder = Promise.promisify(Purchaseorder.find, Purchaseorder);
    var destroyAllPurchaseOrderRow = Promise.promisify(PurchaseOrderRow.destroyAll, PurchaseOrderRow);

    function getDeletedOrderIds(ctx) {
      if (ctx.instance) {
        // Deleting single instance, use ctx.instance
        return Promise.resolve(ctx.instance.orderId);
      } else {
        // Deleting multiple instances, use ctx.where
        return findPurchaseOrder({ where: ctx.where, fields: { orderId: true } })
          .then(function (purchaseOrders) {
            var orderIds = purchaseOrders.map(function (order) { return order.orderId; });
            return { inq: orderIds };
          });
      }
    }

    getDeletedOrderIds(ctx)
      .then(function (orderIds) { return destroyAllPurchaseOrderRow({ orderId: orderIds }); })
      .catch(function (err) {
        var newError = new Error('Aborting delete, couldn\'t delete all purchase order rows.');
        newError.statusCode = 500;
        newError.originalError = err;
        throw newError;
      })
      .nodeify(next);
  });

  Purchaseorder.beforeRemote('prototype.__updateById__order_rows', function(ctx, purchaseOrder, next) {
    // ensures that orderer can't approve rows
    if (ctx.args.data && ctx.args.data.approved == true) {
      // we are trying to approve it
      var app = require('../../server/server');
      var Role = app.models.Role;

      var userIsOwner = Promise.promisify(Role.isOwner, Role);
      // actually need only check, that user is not approving own order
      // because updating others orders is blocked with different ACL rule

      userIsOwner(Purchaseorder, ctx.instance.orderId, ctx.req.accessToken.userId)
      .then(function (owner) {
        if (owner){
          var newError = Error('Authorization Required');
          newError.statusCode = 401;
          next(newError);
        }
      });

    }
    next();
  });

};
