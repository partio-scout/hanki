var Promise = require('bluebird');
var _ = require('lodash');
var app = require('../../server/server');

module.exports = function(Costcenter) {
  Costcenter.afterRemote('**', function(ctx, costcenter, next) {
    var findOrders = Promise.promisify(app.models.Purchaseorder.find, app.models.Purchaseorder);

    function countTotalPriceOfOrders(costcenter) {
      costcenter = costcenter.toObject();
      var filter = {
        where: { costcenterId: costcenter.costcenterId },
        include: {
          relation: 'order_rows',
          scope: {
            include: 'title',
          },
        },
      };

      return findOrders(filter)
      .then(function(orders) {
        if (orders) {
          var totalPrice = _.reduce(orders, function(totalOfOrders, order) {
            order = order.toObject();
            var total = _.reduce(order.order_rows, function(totalOfOrderrows, row) {
              var title = row.title || { };
              var titlePrice = row.priceOverride || title.priceWithTax || 0;
              return totalOfOrderrows + (row.finalPrice || (row.amount * titlePrice));
            }, 0);
            return totalOfOrders + total;
          }, 0);
          return totalPrice;
        } else {
          return 0;
        }
      }).then(function(price) {
        costcenter.totalPrice = price;
        return costcenter;
      });
    }

    if (ctx.result) {
      if (_.isArray(ctx.result)) { // handling many costcenters
        Promise.map(ctx.result, countTotalPriceOfOrders)
        .then(function(costcenters) {
          ctx.result = costcenters;
        }).nodeify(next);
      } else { // only one costcenter
        countTotalPriceOfOrders(ctx.result)
        .then(function(costcenter) {
          ctx.result = costcenter;
        }).nodeify(next);
      }
    }
  });
};
