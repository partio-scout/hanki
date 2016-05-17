var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server');

module.exports = function(Externalorder) {
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

  Externalorder.afterRemote('prototype.updateAttributes', function(ctx, exOrder, next) {
    var findRows = Promise.promisify(app.models.Purchaseorderrow.find, app.models.Purchaseorderrow);
    var updateRow = Promise.promisify(app.models.Purchaseorderrow.upsert, app.models.Purchaseorderrow);
    if (ctx.result) {
      if (_.isArray(ctx.result)) {
        _.forEach(ctx.result, function(exOrder) {
          if (exOrder.ordered === true || exOrder.ordered === false) { // ordered is null if order has never been marked ordered, so we have to change ordered status of rows only if exOrder.ordered is true or false
            findRows({ where: { externalorderId: exOrder.externalorderId } })
            .each(function(row) {
              if (row.ordered !== exOrder.ordered ) {
                row.ordered = exOrder.ordered;
                row.modified = (new Date()).toISOString();
                return updateRow(row);
              }
            }).nodeify(next);
          } else {
            next();
          }
        });
      } else {
        exOrder = ctx.result.toObject();
        if (exOrder.ordered === true || exOrder.ordered === false) {
          findRows({ where: { externalorderId: exOrder.externalorderId } })
          .each(function(row) {
            if (row.ordered !== exOrder.ordered ) {
              row.ordered = exOrder.ordered;
              row.modified = (new Date()).toISOString();
              return updateRow(row);
            }
          }).nodeify(next);
        } else {
          next();
        }
      }
    } else {
      next();
    }
  });
};
