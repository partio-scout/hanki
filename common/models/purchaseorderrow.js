module.exports = function(Purchaseorderrow) {
  Purchaseorderrow.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.modified = (new Date()).toISOString();
    next();
  });

  Purchaseorderrow.CSVExport = function(cb) {
    var toCSV = Promise.promisify(require('json2csv'));
    var app = require('../../server/server');
    var Purchaseorder = app.models.Purchaseorder;
    var find_all_orderrows = Promise.promisify(Purchaseorderrow.find, Purchaseorderrow);
    var find_one_order = Promise.promisify(Purchaseorder.findById, Purchaseorder);
    var find = find_all_orderrows();

    var fields = [ 'amount', 'approved', 'confirmed', 'controllerApproval', 'delivered', 'deliveryId', 'finished', 'memo', 'modified', 'orderName', 'costCenterId', 'orderRowId', 'ordered', 'providerApproval', 'purchaseOrderNumber', 'titleId', 'userSectionApproval', 'nameOverride', 'priceOverride', 'unitOverride' ];

    find
      .then(function(orderrows) {
        toCSV({ data: orderrows, fields: fields })
          .then(function(csv) {
            cb(null, csv);
          })
          .catch(function(err) {
            throw err;
          });
      });
  };
  Purchaseorderrow.remoteMethod(
    'CSVExport',
    {
      http: { path: '/CSVExport', verb: 'post' },
      returns: { arg: 'csv', type: 'string' }
    }
  );
};
