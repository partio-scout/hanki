var Promise = require('bluebird');
var app = require('../../server/server');
var _ = require('lodash');

module.exports = function(Purchaseorder) {
  var checkRowEditOrDeleteAccess = function(ctx, row, next) {
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

        if (app.models.Purchaseorderrow.areChangesProhibited(row)) {
          var err = new Error('You cannot edit or delete rows that have been approved');
          err.statusCode = 401;
          next(err);
        } else {
          next();
        }
      }
    ).catch(function(err) {
      next(err);
    });
  };

  Purchaseorder.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.subscriberId = ctx.req.accessToken.userId;
    next();
  });

  Purchaseorder.afterRemote('create', function(ctx, purchaseOrder, next) {
    app.models.History.remember.PurchaseOrder(ctx, purchaseOrder, 'add');
    next();
  });

  Purchaseorder.beforeRemote('prototype.__updateById__order_rows', checkRowEditOrDeleteAccess);
  Purchaseorder.beforeRemote('prototype.__destroyById__order_rows', checkRowEditOrDeleteAccess);

  Purchaseorder.afterRemote('prototype.__updateById__order_rows', function(ctx, row, next) {
    app.models.History.remember.PurchaseOrder(ctx, row, 'update row');
    next();
  });

  Purchaseorder.afterRemote('prototype.__findById__order_rows', function(ctx, row, next) {
    app.models.Purchaseorderrow.addProhibitChangesField(ctx, row, next);
  });

  Purchaseorder.afterRemote('prototype.updateAttributes', function(ctx, purchaseOrder, next) {
    app.models.History.remember.PurchaseOrder(ctx, purchaseOrder, 'update');
    next();
  });

  Purchaseorder.observe('before delete', function(ctx, next) {
    // Deletes all purchase order rows for the orders about to be deleted

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

  Purchaseorder.checkIfUserHasCostcenter = function(costcenterRelation, costcenterId, userId) {
    var User = app.models.Purchaseuser;
    var Costcenter = app.models.Costcenter;
    var findUser = Promise.promisify(User.findById, User);
    var findCostcenter = Promise.promisify(Costcenter.findById, Costcenter);

    function checkUserCostcenter(userCostcenters, costcenter) {
      return _.some(userCostcenters, { 'costcenterId': costcenter.costcenterId });
    }

    return Promise.join(
      findUser(userId, {
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

  function proceedIfEverythingAllowed(userIsAllowed) {
    if (userIsAllowed) {
      return;
    } else {
      var newError = new Error('Authorization Required');
      newError.statusCode = 401;
      throw newError;
    }
  }

  Purchaseorder.canOrdererEditOrDelete = function(order, userId) {
    var getRoles = Promise.promisify(app.models.Purchaseuser.getRoles, app.models.Purchaseuser);

    return getRoles(userId).then(function(roles) {
      if (_.includes(roles, 'orderer')) {
        return Purchaseorder.checkIfUserHasCostcenter('costcenters', order.costcenterId, userId);
      } else {
        return true;
      }
    });
  };

  Purchaseorder.beforeRemote('prototype.__updateById__order_rows', function(ctx, purchaseOrder, next) {
    if (ctx.args.data) {
      return Purchaseorder.canOrdererEditOrDelete(ctx.instance, ctx.req.accessToken.userId)
        .then(proceedIfEverythingAllowed)
        .nodeify(next);
    }
    next();
  });

  Purchaseorder.beforeRemote('prototype.__destroyById__order_rows', function(ctx, purchaseOrder, next) {
    var findOrderrow = Promise.promisify(app.models.Purchaseorderrow.findById, app.models.Purchaseorderrow);
    if (ctx.args) {
      return findOrderrow(ctx.args.fk, { include: 'Order' }).then(function(row) {
        return row.Order();
      }).then(function(order) {
        return Purchaseorder.canOrdererEditOrDelete(order, ctx.req.accessToken.userId);
      })
      .then(proceedIfEverythingAllowed)
      .nodeify(next);
    }
    next();
  });

  Purchaseorder.beforeRemote('prototype.updateAttributes', function(ctx, purchaseOrder, next) {
    if (ctx.args.data) {
      return Purchaseorder.canOrdererEditOrDelete(ctx.instance, ctx.req.accessToken.userId)
        .then(proceedIfEverythingAllowed)
        .nodeify(next);
    }
    next();
  });

  Purchaseorder.beforeRemote('deleteById', function(ctx, purchaseOrder, next) {
    var findOrder = Promise.promisify(Purchaseorder.findById, Purchaseorder);
    if (ctx.args) {
      return findOrder(ctx.args.id)
      .then(function(order) {
        return Purchaseorder.canOrdererEditOrDelete(order, ctx.req.accessToken.userId);
      })
      .then(proceedIfEverythingAllowed)
      .nodeify(next);
    }
    next();
  });
};
