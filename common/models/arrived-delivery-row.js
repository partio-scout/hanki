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
            orderRow.arrivedStatus = 'ARRIVED';
            orderRow.delivered = true;
          } else {
            orderRow.arrivedStatus = 'PARTLY';
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

  ArrivedDeliveryRow.afterRemote('CSVExport', function(ctx, delivery, next) {
    ctx.res.attachment('arrived-deliveries.csv');
    ctx.res.send(ctx.result.csv);
  });

  ArrivedDeliveryRow.CSVExport = function(externalorderId, date, cb) {
    var toCSV = Promise.promisify(require('json2csv'));
    var findAllDeliveryRows = Promise.promisify(ArrivedDeliveryRow.find, ArrivedDeliveryRow);

    var whereFilter = {};
    if (externalorderId) {
      whereFilter.externalorderId = externalorderId;
    }
    if (Date.parse(date)) {
      whereFilter.arrivalDate = date;
    }

    var filter = {
      include: [
        {
          relation: 'arrivedDelivery',
          scope: {
            where: whereFilter,
            include: {
              relation: 'externalorder',
            },
          },
        },
        {
          relation: 'orderRow',
          scope: {
            include: [
              {
                relation: 'title',
              },
              {
                relation: 'Order',
                scope: {
                  include: {
                    relation: 'costcenter',
                  },
                },
              },
            ],
          },
        },
      ],
    };

    function organizeDeliveryRowsForExport(deliveryRow) {
      deliveryRow = deliveryRow.toJSON();

      if (deliveryRow.arrivedDelivery) {
        if (deliveryRow.orderRow.titleId === 0) {
          deliveryRow.title = deliveryRow.orderRow.nameOverride;
          deliveryRow.unit = deliveryRow.orderRow.unitOverride || 'kpl';
          deliveryRow.price = deliveryRow.orderRow.priceOverride * deliveryRow.amount;
        } else {
          deliveryRow.title = deliveryRow.orderRow.title.name;
          deliveryRow.unit = deliveryRow.orderRow.title.unit;
          deliveryRow.price = deliveryRow.orderRow.title.priceWithTax * deliveryRow.amount;
        }

        deliveryRow.arrivalDate = deliveryRow.arrivedDelivery.arrivalDate;
        deliveryRow.supplierName = deliveryRow.arrivedDelivery.externalorder.supplierName;
        deliveryRow.externalorderCode = deliveryRow.arrivedDelivery.externalorder.externalorderCode;
        deliveryRow.costCenterCode = deliveryRow.orderRow.Order.costcenter.code;
        deliveryRow.orderName = deliveryRow.orderRow.Order.name;

        return deliveryRow;
      }
      return {};
    }

    function deliveriesToCSV(deliveries) {
      var fields = [ 'arrivalDate', 'supplierName', 'externalorderCode', 'title', 'amount', 'unit', 'price', 'costCenterCode', 'orderName' ];
      return toCSV({ data: deliveries, fields: fields });
    }

    findAllDeliveryRows(filter)
    .map(organizeDeliveryRowsForExport)
    .then(deliveriesToCSV)
    .nodeify(cb);
  };

  ArrivedDeliveryRow.remoteMethod(
    'CSVExport',
    {
      http: { path: '/CSVExport/:externalorderId/:date', verb: 'get' },
      accepts: [
        { arg: 'externalorderId', type: 'number', required: false, http: { source: 'path' } },
        { arg: 'date', type: 'string', required: false, http: { source: 'path' } },
      ],
      returns: { arg: 'csv', type: 'string' },
    }
  );
};
