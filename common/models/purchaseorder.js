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
    var User = app.models.Purchaseuser;
    var Costcenter = app.models.Costcenter;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    var findUser = Promise.promisify(User.findById, User);
    var findCostcenter = Promise.promisify(Costcenter.findById, Costcenter);

    // Allow order approving only for costcenter approvers
    if (ctx.args.data && (_.isBoolean(ctx.args.data.approved))) {
      // changing state of approval

      Promise.join(
        findUser(ctx.req.accessToken.userId, {
          include: [{
            relation: 'isApproverOfCostcenter',
          }],
        }),
        findCostcenter(ctx.instance.costcenterId),
        function (user, costcenter, err) {
          if (err) throw401();
          var userCostcenter = user.isApproverOfCostcenter();
          proceedIfApprovalAllowed(userCostcenter, costcenter);
        }
      );

    }

    if (ctx.args.data && (_.isBoolean(ctx.args.data.controllerApproval))) {
      // changing state of ControllerApproval
      // check if user is controller
      Role.isInRole('controller', { principalType: RoleMapping.USER, principalId: ctx.req.accessToken.userId }, function (err, inRole) {
        if (err) console.log(err);
        if (inRole) {
          next();
        } else {
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

    function proceedIfApprovalAllowed(userCostcenter, rowCostcenter) {

      var allowed = _.some(userCostcenter, { 'costcenterId': rowCostcenter.costcenterId });
      if (allowed) {
        // user is allowed to approve rows for costcenter
        next();
      } else {
        throw401();
      }
    }

    next();
  });

};
