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

  Purchaseorder.checkIfUserHasCostcenter = function(costcenterRelation, costcenterId, accessToken) {
    var User = app.models.Purchaseuser;
    var Costcenter = app.models.Costcenter;
    var findUser = Promise.promisify(User.findById, User);
    var findCostcenter = Promise.promisify(Costcenter.findById, Costcenter);

    function checkUserCostcenter(userCostcenters, costcenter) {
      return _.some(userCostcenters, { 'costcenterId': costcenter.costcenterId });
    }

    return Promise.join(
      findUser(accessToken.userId, {
        include: [{
          relation: costcenterRelation,
        }],
      }),
      findCostcenter(costcenterId),
      function(user, costcenter, err) {
        if (err) {
          throw new Error(err);
        } else {
          var usersCostcenters = user[costcenterRelation]();
          return checkUserCostcenter(usersCostcenters, costcenter);
        }
      }
    );
  };

  Purchaseorder.beforeRemote('prototype.__updateById__order_rows', function(ctx, purchaseOrder, next) {
    function proceedIfEverythingAllowed(userIsAllowed) {
      if (userIsAllowed) {
        next();
      } else {
        var newError = new Error('Authorization Required');
        newError.statusCode = 401;
        next(newError);
      }
    }

    if (ctx.args.data) {
      // Check that user is orderer of the costcenter of order
      return Purchaseorder.checkIfUserHasCostcenter('costcenters', ctx.instance.costcenterId, ctx.req.accessToken)
      .then(proceedIfEverythingAllowed);
    } else {
      next();
    }
  });

  Purchaseorder.beforeRemote('prototype.updateAttributes', function(ctx, purchaseOrder, next) {
    function proceedIfEverythingAllowed(userIsAllowed) {

      if (userIsAllowed) {
        next();
      } else {
        var newError = new Error('Authorization Required');
        newError.statusCode = 401;
        next(newError);
      }
    }

    if (ctx.args.data) {
      // Check that user is orderer of the costcenter of order
      return Purchaseorder.checkIfUserHasCostcenter('costcenters', ctx.instance.costcenterId, ctx.req.accessToken)
      .then(proceedIfEverythingAllowed);
    } else {
      next();
    }
  });
};
