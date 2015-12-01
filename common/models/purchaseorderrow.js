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
    var Title = app.models.Title;
    var Titlegroup = app.models.Titlegroup;
    var Delivery = app.models.Delivery;
    var findAllOrderrows = Promise.promisify(Purchaseorderrow.find, Purchaseorderrow);
    var findOrder = Promise.promisify(Purchaseorder.findById, Purchaseorder);
    var findTitle = Promise.promisify(Title.findById, Title);
    var findTitlegroup = Promise.promisify(Titlegroup.findById, Titlegroup);
    var findDelivery = Promise.promisify(Delivery.findById, Delivery);
    var findCostcenter = Promise.promisify(Costcenter.findById, Costcenter);
    var findOrderrows = findAllOrderrows();

    function replaceOrderIdWithNameAndAddCostCenter(orderrow) {
      return findOrder(orderrow.orderId).then(function(order) {
        if (order === null) {
          var err = new Error('Could not find order with id ' + orderrow.orderId);
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

    function addTitleNameAndUnitAndTitlegroupName(orderrow) {
      return findTitle(orderrow.titleId).then(function(title) {
        if (title === null) {
          var err = new Error('Could not find title with id ' + orderrow.titleId);
          err.status = 422;
          throw err;
        } else {
          return findTitlegroup(title.titlegroupId).then(function(titlegroup) {
            orderrow.titlegroupName = titlegroup.name;
            if (title.titlegroupId === 0) { // Muu tuote: nimi ja yksikkö tilausrivistä
              orderrow.titleName = orderrow.nameOverride;
              orderrow.titleUnit = unitOverride;
            } else {
              orderrow.titleName = title.name;
              orderrow.titleUnit = title.unit;
            }
            return orderrow;
          });
        }
      });
    }

    function addDeliveryDescription(orderrow) {
      return findDelivery(orderrow.deliveryId).then(function(delivery) {
        if (delivery === null) {
          var err = new Error('Could not find delivery with id ' + orderrow.deliveryId);
          err.status = 422;
          throw err;
        } else {
          orderrow.deliveryDescription = delivery.description;
          return orderrow;
        }
      });
    }

    function orderrowsToCSV(orderrows) {
      var fields = [ 'amount', 'approved', 'confirmed', 'controllerApproval', 'delivered', 'deliveryId', 'finished', 'memo', 'modified', 'orderId', 'orderName', 'costCenterCode', 'orderRowId', 'ordered', 'providerApproval', 'purchaseOrderNumber', 'titleId', 'titleName', 'titleUnit', 'titlegroupName', 'userSectionApproval', 'nameOverride', 'priceOverride', 'unitOverride', 'requestService', 'deliveryDescription' ];
      return toCSV({ data: orderrows, fields: fields });
    }

    findOrderrows.map(replaceOrderIdWithNameAndAddCostCenter)
    .map(addTitleNameAndUnitAndTitlegroupName)
    .map(addDeliveryDescription)
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
