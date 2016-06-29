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

  ArrivedDeliveryRow.afterRemote('CSVExport', function(ctx, delivery, next) {
    ctx.res.attachment('arrived-deliveries.csv');
    ctx.res.send(ctx.result.csv);
  });

  ArrivedDeliveryRow.CSVExport = function(externalorderId, date, cb) {
    var toCSV = Promise.promisify(require('json2csv'));
    var findAllDeliveryRows = Promise.promisify(ArrivedDeliveryRow.find, ArrivedDeliveryRow);

    var filter = {
      include: [
        {
          arrivedDelivery: 'externalorder',
        },
        {
          orderRow: [
            'title',
            {
              Order: 'costcenter',
            },
          ],
        },
      ],
    };

    function filterDeliveryRowsBasedOnArrivalDate(row) { // to be used in lodash filter to remove rows that don't have desired arrivalDate
      row = row.toJSON();
      if (Date.parse(date) === Date.parse(row.arrivedDelivery.arrivalDate)) {
        return true;
      }
      return false;
    }

    function filterDeliveryRowsBasedOnExternalOrder(row) {
      row = row.toJSON();
      if (row.arrivedDelivery.externalorderId === externalorderId) {
        return true;
      }
      return false;
    }

    function organizeDeliveryRowsForExport(deliveryRow) {
      deliveryRow = deliveryRow.toJSON();

      deliveryRow.arrivalDate = deliveryRow.arrivedDelivery.arrivalDate;
      deliveryRow.supplierName = deliveryRow.arrivedDelivery.externalorder.supplierName;
      deliveryRow.externalorderCode = deliveryRow.arrivedDelivery.externalorder.externalorderCode;
      deliveryRow.title = deliveryRow.orderRow.nameOverride || deliveryRow.orderRow.title.name;
      deliveryRow.unit = deliveryRow.orderRow.unitOverride || deliveryRow.orderRow.title.unit;
      deliveryRow.price = (deliveryRow.orderRow.priceOverride || deliveryRow.orderRow.title.priceWithTax) * deliveryRow.amount;
      deliveryRow.costCenterCode = deliveryRow.orderRow.Order.costcenter.code;
      deliveryRow.orderName = deliveryRow.orderRow.Order.name;

      return deliveryRow;
    }

    function deliveriesToCSV(deliveries) {
      var fields = [ 'arrivalDate', 'supplierName', 'externalorderCode', 'title', 'amount', 'unit', 'price', 'costCenterCode', 'orderName' ];
      return toCSV({ data: deliveries, fields: fields });
    }

    findAllDeliveryRows(filter)
    .then(function(rows) {
      if (Date.parse(date)) {
        return _.filter(rows, filterDeliveryRowsBasedOnArrivalDate);
      }
      return rows;
    })
    .then(function(rows) {
      if (externalorderId) {
        return _.filter(rows, filterDeliveryRowsBasedOnExternalOrder);
      }
      return rows;
    })
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
