var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server');

module.exports = function(Externalorder) {
  Externalorder.afterRemote('create', function(ctx, exOrder, next) {
    var updateExternalorder = Promise.promisify(Externalorder.upsert, Externalorder);
    if (ctx.result && !_.has(ctx.result, 'count')) {
      if (_.isArray(ctx.result)) {
        ctx.result = Promise.map(ctx.result, function(order) {
          order = order.toObject();
          if (!order.externalorderCode || order.externalorderCode == '') {
            order.externalorderCode = _.padLeft(order.externalorderId, 5, '0');
            return updateExternalorder(order);
          }
          return order;
        }).nodeify(next);
      } else {
        if (!ctx.result.externalorderCode || ctx.result.externalorderCode == '') {
          ctx.result.externalorderCode = _.padLeft(ctx.result.externalorderId, 5, '0');
          return updateExternalorder(ctx.result).nodeify(next);
        } else {
          next();
        }
      }
    } else {
      next();
    }
  });

  Externalorder.afterRemote('*', function(ctx, exOrder, next) {
    if (ctx.result && !_.has(ctx.result, 'count')) {
      if (_.isArray(ctx.result)) {
        ctx.result = _.map(ctx.result, function(order) {
          order = order.toObject();
          if (!order.externalorderCode || order.externalorderCode == '') {
            order.externalorderCode = _.padLeft(order.externalorderId, 5, '0');
          }
          return order;
        });
        next();
      } else {
        ctx.result = ctx.result.toObject();
        if (!ctx.result.externalorderCode || ctx.result.externalorderCode == '') {
          ctx.result.externalorderCode = _.padLeft(ctx.result.externalorderId, 5, '0');
        }
        next();
      }
    } else {
      next();
    }
  });

  Externalorder.afterRemote('prototype.updateAttributes', function(ctx, externalOrder, next) {
    var findRows = Promise.promisify(app.models.Purchaseorderrow.find, app.models.Purchaseorderrow);
    var updateRow = Promise.promisify(app.models.Purchaseorderrow.upsert, app.models.Purchaseorderrow);

    function updateOrderedStatusOfExtOrdersRows(extOrder) {
      if (extOrder.ordered === true || extOrder.ordered === false) { // ordered is null if order has never been marked ordered, so we have to change ordered status of rows only if exOrder.ordered is true or false
        return findRows({ where: { externalorderId: extOrder.externalorderId } })
        .each(function(row) {
          if (row.ordered !== extOrder.ordered ) {
            row.ordered = extOrder.ordered;
            row.modified = (new Date()).toISOString();
            return updateRow(row);
          }
          return Promise.resolve();
        });
      }
      return Promise.resolve();
    }

    function handleUpdatingRowsOfResult(result) {
      if (_.isArray(result)) {
        return Promise.each(ctx.result, updateOrderedStatusOfExtOrdersRows);
      } else {
        var extOrder = result.toObject();
        return updateOrderedStatusOfExtOrdersRows(extOrder);
      }
    }

    if (ctx.result) {
      handleUpdatingRowsOfResult(ctx.result).nodeify(next);
    } else {
      next();
    }
  });
};
