var Promise = require('bluebird');
var _ = require('lodash');
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

  Purchaseorderrow.afterRemote('CSVExport', function(ctx, orderrow, next) {
    ctx.res.attachment('orders.csv');

    ctx.res.send(ctx.result.csv);
  });

  Purchaseorderrow.CSVExport = function(cb) {
    var toCSV = Promise.promisify(require('json2csv'));
    var findAllOrderrows = Promise.promisify(Purchaseorderrow.find, Purchaseorderrow);

    var filter = {
      include: [
        'delivery',
        {
          title: 'titlegroup',
        },
        {
          Order: ['costcenter', 'subscriber'],
        },
      ],
    };

    function organizeOrderrowsForExport(orderrow) {
      orderrow = orderrow.toObject();

      if (orderrow.titleId === 0) {
        orderrow.titlegroupName = 'Muu tuote';
        orderrow.titleName = orderrow.nameOverride;
        orderrow.titleUnit = orderrow.unitOverride;
        orderrow.price = orderrow.priceOverride;
      } else {
        orderrow.titlegroupName = orderrow.title.titlegroup.name;
        orderrow.titleName = orderrow.title.name;
        orderrow.titleUnit = orderrow.title.unit;
        orderrow.price = orderrow.title.priceWithTax;
      }

      orderrow.orderName = orderrow.Order.name;
      orderrow.costcenterCode = orderrow.Order.costcenter.code;
      orderrow.ordererEmail = orderrow.Order.subscriber.email;

      orderrow.deliveryDescription = orderrow.delivery.description;

      return orderrow;
    }

    function orderrowsToCSV(orderrows) {
      var fields = [ 'orderRowId', 'titlegroupName',	'titleId',	'titleName', 'amount',	'titleUnit', 'price',	'deliveryDescription',	'costcenterCode',	'orderName', 'ordererEmail',	'confirmed',	'providerApproval',	'controllerApproval',	'userSectionApproval',	'ordered',	'purchaseOrderNumber',	'requestService',	'delivered',	'modified',	'memo' ];
      return toCSV({ data: orderrows, fields: fields });
    }

    findAllOrderrows(filter)
    .map(organizeOrderrowsForExport)
    .then(orderrowsToCSV)
    .nodeify(cb);
  };

  //Don't expose this directly over API - allows overwriting any field
  Purchaseorderrow.approve = function(approvalType, ids, cb) {
    Purchaseorderrow.findByIds(ids).then(function(rows) {
      var updates = _.map(rows, function(row) {
        return Promise.fromNode(function(callback) {
          row.modified = (new Date()).toISOString();
          row[approvalType] = true;
          row.save(callback);
        });
      });
      return Promise.all(updates).nodeify(cb);
    }).catch(function(err) {
      cb(err);
    });
  };

  Purchaseorderrow.unapprove = function(approvalType, ids, cb) {
    Purchaseorderrow.findByIds(ids).then(function(rows) {
      var updates = _.map(rows, function(row) {
        return Promise.fromNode(function(callback) {
          row.modified = (new Date()).toISOString();

          // Cannot unapprove if already approved
          if (row[approvalType] === true) {
            return callback(null, row);
          }

          // Reset other approvals to null (i.e. return to orderer)
          row.controllerApproval = null;
          row.userSectionApproval = null;
          row.providerApproval = null;

          row[approvalType] = false;

          row.save(callback);
        });
      });
      return Promise.all(updates).nodeify(cb);
    }).catch(function(err) {
      cb(err);
    });
  };

  Purchaseorderrow.approveController = function(ids, cb) {
    Purchaseorderrow.approve('controllerApproval', ids, cb);
  };

  Purchaseorderrow.unapproveController = function(ids, cb) {
    Purchaseorderrow.unapprove('controllerApproval', ids, cb);
  };

  Purchaseorderrow.approveProcurement = function(ids, cb) {
    Purchaseorderrow.approve('providerApproval', ids, cb);
  };

  Purchaseorderrow.remoteMethod(
    'CSVExport',
    {
      http: { path: '/CSVExport', verb: 'get' },
      returns: { arg: 'csv', type: 'string' },
    }
  );

  Purchaseorderrow.remoteMethod(
    'approveController',
    {
      accepts: { arg: 'ids', type: 'array', required: 'true' },
      returns: { arg: 'result', type: 'string' },
      http: { path: '/approve/controller', verb: 'post' },
    }
  );

  Purchaseorderrow.remoteMethod(
    'unapproveController',
    {
      accepts: { arg: 'ids', type: 'array', required: 'true' },
      returns: { arg: 'result', type: 'string' },
      http: { path: '/unapprove/controller', verb: 'post' },
    }
  );

  Purchaseorderrow.remoteMethod(
    'approveProcurement',
    {
      accepts: { arg: 'ids', type: 'array', required: 'true' },
      returns: { arg: 'result', type: 'string' },
      http: { path: '/approve/procurement', verb: 'post' },
    }
  );
};
