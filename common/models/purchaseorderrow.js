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
    var Costcenter = app.models.Costcenter;
    var findAllOrderrows = Promise.promisify(Purchaseorderrow.find, Purchaseorderrow);
    var findOrder = Promise.promisify(Purchaseorder.findById, Purchaseorder);
    var findCostcenter = Promise.promisify(Costcenter.findById, Costcenter);
    var findOrderrows = findAllOrderrows();

    function replaceOrderIdWithNameAndAddCostCenter(orderrow) {
      return findOrder(orderrow.orderId).then(function(order) {
        if (order === null) {
          var err = new Error('Could not find order with id ' + orderrow.id);
          err.status = 422;
          throw err;
        } else {
          return findCostcenter(order.costcenterId).then(function(costcenter) {
            var o = orderrow.toObject();
            o.orderName = order.name;
            o.costCenterCode = costcenter.code;
            return o;
          });
        }
      });
    }

    function orderrowsToCSV(orderrows) {
      var fields = [ 'amount', 'approved', 'confirmed', 'controllerApproval', 'delivered', 'deliveryId', 'finished', 'memo', 'modified', 'orderId', 'orderName', 'costCenterCode', 'orderRowId', 'ordered', 'providerApproval', 'purchaseOrderNumber', 'titleId', 'userSectionApproval', 'nameOverride', 'priceOverride', 'unitOverride', 'requestService' ];
      return toCSV({ data: orderrows, fields: fields });
    }

    findOrderrows.map(replaceOrderIdWithNameAndAddCostCenter)
    .then(orderrowsToCSV)
    .nodeify(cb);

  };
  Purchaseorderrow.remoteMethod(
    'CSVExport',
    {
      http: { path: '/CSVExport', verb: 'post' },
      returns: { arg: 'csv', type: 'string' }
    }
  );
};
