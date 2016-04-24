var Promise = require('bluebird');
var _ = require('lodash');
var app = require('../../server/server');

module.exports = function(Purchaseorderrow) {
  var approvalTypes = {
    Controller: {
      fieldName: 'controllerApproval',
      fieldOperations: {
        'approve': true,
        'unapprove': false,
        'reset': null,
      },
    },
    Procurement: {
      fieldName: 'providerApproval',
      fieldOperations: {
        'approve': true,
        'unapprove': false,
        'reset': null,
      },
    },
    UserSection: {
      fieldName: 'userSectionApproval',
      fieldOperations: {
        'approve': true,
        'unapprove': false,
        'reset': null,
      },
    },
  };

  Purchaseorderrow.areChangesProhibited = function(row) {
    var approvalValues = _(approvalTypes)
      .pluck('fieldName')
      .map(function(fieldName) {
        return row[fieldName];
      })
      .value();

    if (_.includes(approvalValues, false)) {
      return false;
    } else if (_.includes(approvalValues, true)) {
      return true;
    } else {
      return false;
    }
  };

  Purchaseorderrow.addProhibitChangesFieldToResultRow = function(row) {
    row.prohibitChanges = Purchaseorderrow.areChangesProhibited(row);
    return row;
  };

  Purchaseorderrow.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.modified = (new Date()).toISOString();
    next();
  });

  Purchaseorderrow.afterRemote('create', function(ctx, purchaseOrder, next) {
    app.models.History.remember.PurchaseOrderRow(ctx, purchaseOrder, 'add row');
    next();
  });

  Purchaseorderrow.afterRemote('**', function(ctx, purchaseOrder, next) {
    if (ctx.result && _.isArray(ctx.result)) {
      ctx.result = _.map(ctx.result, Purchaseorderrow.addProhibitChangesFieldToResultRow);
    } else if (ctx.result) {
      Purchaseorderrow.addProhibitChangesFieldToResultRow(ctx.result);
    }
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
  Purchaseorderrow.setField = function(fieldName, value, ids, cb) {
    Purchaseorderrow.findByIds(ids).then(function(rows) {
      var updates = _.map(rows, function(row) {
        return Promise.fromNode(function(callback) {
          row.modified = (new Date()).toISOString();
          row[fieldName] = value;
          row.save(callback);
        });
      });
      return Promise.all(updates).nodeify(cb);
    }).catch(function(err) {
      cb(err);
    });
  };

  _.each(approvalTypes, function(type, approvalName) {
    var fieldName = type.fieldName;
    _.each(type.fieldOperations, function(opValue, opName) {
      var methodName = opName + approvalName;
      Purchaseorderrow[methodName] = function(ids, cb) {
        Purchaseorderrow.setField(fieldName, opValue, ids, cb);
      };

      Purchaseorderrow.remoteMethod(methodName, {
        accepts: { arg: 'ids', type: 'array', required: 'true' },
        returns: { arg: 'result', type: 'string' },
        http: { path: '/' + opName + '/' + approvalName.toLowerCase(), verb: 'post' },
      });
    });
  });

  Purchaseorderrow.remoteMethod(
    'CSVExport',
    {
      http: { path: '/CSVExport', verb: 'get' },
      returns: { arg: 'csv', type: 'string' },
    }
  );
};
