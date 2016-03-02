var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(Costcenter) {
  Costcenter.getTotalPriceOfOrders = function(id, cb) {
    var findCostcenter = Promise.promisify(Costcenter.findById, Costcenter);

    var filter = {
      include: {
        relation: 'orders',
        scope: {
          include: {
            relation: 'order_rows',
            scope: {
              include: 'title',
            },
          },
        },
      },
    };

    findCostcenter(id, filter)
    .then(function(costcenter) {
      if (costcenter) {
        costcenter = costcenter.toObject();
        var totalPrice = _.reduce(costcenter.orders, function(totalOfOrders, order) {
          var total = _.reduce(order.order_rows, function(totalOfOrderrows, row) {
            var title = row.title || { };
            var titlePrice = row.priceOverride || title.priceWithTax || 0;
            return totalOfOrderrows + row.amount * titlePrice;
          }, 0);
          return totalOfOrders + total;
        }, 0);
        return totalPrice;
      } else {
        throw new Error('Haluttua kustannuspaikkaa ei löytynyt');
      }
    }).nodeify(cb);
  };

  Costcenter.remoteMethod(
    'getTotalPriceOfOrders',
    {
      http: { path: '/getTotalPriceOfOrders', verb: 'get' },
      accepts: { arg: 'id', type: 'string' },
      returns: { arg: 'price', type: 'string' },
    }
  );
};
