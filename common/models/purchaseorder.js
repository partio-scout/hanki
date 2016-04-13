var Promise = require('bluebird');
var app = require('../../server/server');

module.exports = function(Purchaseorder) {
  Purchaseorder.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.subscriberId = ctx.req.accessToken.userId;
    next();
  });

  Purchaseorder.afterRemote('create', function(ctx, purchaseOrder, next) {
    app.models.History.remember.PurchaseOrder(ctx, purchaseOrder, 'add');
    next();
  });

  Purchaseorder.beforeRemote('prototype.__updateById__order_rows', function(ctx, row, next) {
    var isInRole = Promise.promisify(app.models.Role.isInRole, app.models.Role);
    var id = ctx.args.fk;
    var userId = ctx.req.accessToken.userId;

    Promise.join(
      app.models.Purchaseorderrow.findById(id),
      isInRole('procurementMaster', { principalType: app.models.RoleMapping.USER, principalId: userId }),
      isInRole('procurementAdmin', { principalType: app.models.RoleMapping.USER, principalId: userId }),
      function(row, isProcurementMaster, isProcurementAdmin) {
        if (isProcurementMaster || isProcurementAdmin) {
          return next();
        }

        var hasApprovals = row.controllerApproval || row.providerApproval;
        if (hasApprovals) {
          var err = new Error('You cannot edit rows that have approvals');
          err.statusCode = 401;
          next(err);
        } else {
          next();
        }
      }
    ).catch(function(err) {
      next(err);
    });
  });

  Purchaseorder.afterRemote('prototype.__updateById__order_rows', function(ctx, row, next) {
    app.models.History.remember.PurchaseOrder(ctx, row, 'update row');
    next();
  });

  Purchaseorder.afterRemote('prototype.__findById__order_rows', function(ctx, row, next) {
    ctx.result = app.models.Purchaseorderrow.addProhibitChangesFieldToResultRow(ctx.result);
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
};
