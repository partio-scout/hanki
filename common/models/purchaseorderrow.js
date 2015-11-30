var Promise = require('bluebird');
var app = require('../../server/server');

module.exports = function(Purchaseorderrow) {
  Purchaseorderrow.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.modified = (new Date()).toISOString();
    next();
  });

  Purchaseorderrow.afterRemote('create', function(ctx, purchaseOrder, next) {
    app.models.History.remember.PurchaseOrderRow(ctx, purchaseOrder, 'add row');
    next();
  });

  Purchaseorderrow.CSVExport = function(cb) {
    var toCSV = Promise.promisify(require('json2csv'));
    var app = require('../../server/server');
    var Purchaseorder = app.models.Purchaseorder;
    var find_all_orderrows = Promise.promisify(Purchaseorderrow.find, Purchaseorderrow);
    var find_order = Promise.promisify(Purchaseorder.findById, Purchaseorder);
    var find_orderrows = find_all_orderrows();

    var fields = [ 'amount', 'approved', 'confirmed', 'controllerApproval', 'delivered', 'deliveryId', 'finished', 'memo', 'modified', 'orderId', 'orderName', 'costCenterId', 'orderRowId', 'ordered', 'providerApproval', 'purchaseOrderNumber', 'titleId', 'userSectionApproval', 'nameOverride', 'priceOverride', 'unitOverride' ];

    function replaceOrderIdWithNameAndAddCostCenter(orderrow) {
      return find_order(orderrow.orderId).then(function(order) {
        if (order === null) {
          //res.status(422);
          var err = new Error('Could not find order with id ' + orderrow.id);
          err.status = 422;
          throw err;
        } else {
          var o = orderrow.toObject();
          o.orderName = order.name;
          o.costCenterId = order.costcenterId;
          return o;
        }
      }, function(err) {
        cb(err,null);
      });
    }

    find_orderrows.map(function(orderrow) {
      return replaceOrderIdWithNameAndAddCostCenter(orderrow);
    }).then(function(orderrows) {
      toCSV({ data: orderrows, fields: fields })
        .then(function(csv) {
          cb(null, csv);
        });
    }).catch(function(err) {
      cb(err);
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
