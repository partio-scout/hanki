var Promise = require('bluebird');
var app = require('../../server/server');
var _ = require('lodash');

module.exports = function(Purchaseorder) {
  Purchaseorder.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.subscriberId = ctx.req.accessToken.userId;
    next();
  });

  Purchaseorder.afterRemote('create', function(ctx, purchaseOrder, next) {
    app.models.History.remember.PurchaseOrder(ctx, purchaseOrder, 'add');
    next();
  });

  Purchaseorder.afterRemote('prototype.__updateById__order_rows', function(ctx, purchaseOrder, next) {
    app.models.History.remember.PurchaseOrder(ctx, purchaseOrder, 'update row');
    next();
  });

  Purchaseorder.afterRemote('prototype.updateAttributes', function(ctx, purchaseOrder, next) {
    app.models.History.remember.PurchaseOrder(ctx, purchaseOrder, 'update');
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
    // Allow order approving only for costcenter approvers
    if (ctx.args.data && (ctx.args.data.approved == true || ctx.args.data.approved == false)) {
      // changing state of approval

      var User = app.models.Purchaseuser;
      var Costcenter = app.models.Costcenter;
      var findUser = Promise.promisify(User.findById, User);
      var findCostcenter = Promise.promisify(Costcenter.findById, Costcenter);

      var foundUser = findUser(ctx.req.accessToken.userId, {
        include: [{
          relation: 'isApproverOfCostcenter',
        }],
      });
      var foundCostcenter = findCostcenter(ctx.instance.costcenterId);

      Promise.join(foundUser, foundCostcenter, function (user, costcenter, err) {
        if (err) {
          throw401(err);
        }

        var userCostcenter = user.isApproverOfCostcenter();

        // allow user to be approver on multiple costcenters
        var allowed = false;
        _.forEach(userCostcenter, function (cs) {
          if (JSON.stringify(costcenter) == JSON.stringify(cs)) {
            allowed = true;
          }
        });

        if (allowed) {
          // user is approver of costcenter
          console.log('Allowed to update');
          next();
        } else {
          console.log('NOT Allowed to update');
          throw401();
        }
      });

    }

    function throw401(err) {
      var newError = new Error('Authorization Required');
      newError.statusCode = 401;
      newError.originalError = err;
      next(newError);
    }

    next();
  });

};
