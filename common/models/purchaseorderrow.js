var Promise = require('bluebird');
var app = require('../../server/server');
var loopback = require('loopback');

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

  Purchaseorderrow.observe('before save', function(ctx, next) {
    var sendError = function(message, code) {
      var err = new Error(message);
      err.statusCode = code;
      next(err);
    };

    if (ctx.currentInstance && ctx.currentInstance.finalized) {
      var access = loopback.getCurrentContext().get('accessToken');
      var RoleMapping = app.models.RoleMapping;

      app.models.Role.isInRole('procurementMaster',{ principalType: RoleMapping.USER, principalId: access.userId },
        function(err,isMaster) {
          if (err) {sendError('Cannot verify user',500);}
          if (isMaster) {
            next();
          } else {
            sendError('Cannot edit finalized orders.',401);
          }
        }
      );
    } else {
      next();
    }
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

  Purchaseorderrow.remoteMethod(
    'CSVExport',
    {
      http: { path: '/CSVExport', verb: 'get' },
      returns: { arg: 'csv', type: 'string' },
    }
  );
};
