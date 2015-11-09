var Promise = require('bluebird');
var app = require('../../server/server');

module.exports = function(Purchaseorder) {
  Purchaseorder.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.subscriberId = ctx.req.accessToken.userId;
    next();
  });

  Purchaseorder.afterRemote('create', function(ctx, purchaseOrder, next) {
    app.models.History.create(
      {
        'userId': ctx.req.accessToken.userId,
        'comment':'Added a new purchase order',
        'purchaseOrderId':purchaseOrder.orderId,
      },
      function(err,instance) {if (err) {throw err;} console.log(instance);}
    );
    next();
  });

  Purchaseorder.afterRemote('delete', function(ctx, purchaseOrder, next) {
    app.models.History.create(
      {
        'userId': ctx.req.accessToken.userId,
        'comment':'Removed a purchase order',
        'purchaseOrderId':purchaseOrder.orderId,
      },
      function(err,instance) {if (err) {throw err;} console.log(instance);}
    );
    next();
  });

  Purchaseorder.afterRemote('update', function(ctx, purchaseOrder, next) {
    app.models.History.create(
      {
        'userId': ctx.req.accessToken.userId,
        'comment':'Updated a purchase order',
        'purchaseOrderId':purchaseOrder.orderId,
      },
      function(err,instance) {if (err) {throw err;} console.log(instance);}
    );
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
};
