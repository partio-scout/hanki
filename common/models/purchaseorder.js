var Promise = require('bluebird');

module.exports = function(Purchaseorder) {
  Purchaseorder.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.subscriberId = ctx.req.accessToken.userId;
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

  Purchaseorder.CSVExport = function(cb) {
    var toCSV = Promise.promisify(require('json2csv'));
    var app = require('../../server/server');
    var Purchaseorderrow = app.models.Purchaseorderrow;
    var find_orderrows = Promise.promisify(Purchaseorderrow.find, Purchaseorderrow);
    var find_all = Promise.promisify(Purchaseorder.find, Purchaseorder);
    var find = find_all();

    var fields = [ "orderId", "subscriberId", "name", "costcenterId" ];
    var csv = "";

    find
      .then(function(orders) {
        toCSV({ data: orders, fields: fields })
          .then(function(csv) {
            cb(null, csv);
          })
          .catch(function(err) {
            throw err;
          });
      });


  };
  Purchaseorder.remoteMethod(
    'CSVExport',
    {
      http: { path: '/CSVExport', verb: 'post' },
      returns: { arg: 'csv', type: 'string' }
    }
  );
};
