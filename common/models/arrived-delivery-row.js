var Promise = require('bluebird');
var app = require('../../server/server');
var _ = require('lodash');

module.exports = function(ArrivedDeliveryRow) {
  ArrivedDeliveryRow.afterRemote('create', function(ctx, instance, next) {
    var findOrderRow = Promise.promisify(app.models.Purchaseorderrow.findById, app.models.Purchaseorderrow);
    var updateOrderRow = Promise.promisify(app.models.Purchaseorderrow.upsert, app.models.Purchaseorderrow);

    var updateOrderRowBasedOnArrivedRow = function(arrivedRow) {
      return findOrderRow(arrivedRow.orderRowId)
        .then(function(orderRow) {
          orderRow.arrivedAmount = orderRow.arrivedAmount + arrivedRow.amount;
          if (arrivedRow.finalDelivery || (orderRow.arrivedAmount >= orderRow.amount)) {
            orderRow.arrivedStatus = 2;
            orderRow.delivered = true;
          } else {
            orderRow.arrivedStatus = 1;
          }
          orderRow.modified = (new Date()).toISOString();
          return updateOrderRow(orderRow);
        });
    };

    if (ctx.result) {
      if (_.isArray(ctx.result)) {
        return Promise.each(ctx.result, updateOrderRowBasedOnArrivedRow).nodeify(next);
      } else {
        return updateOrderRowBasedOnArrivedRow(ctx.result).nodeify(next);
      }
    } else {
      next();
    }
  });
};
