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

  Purchaseorderrow.afterRemote('CSVExport', function(ctx, orderrow, next) {
    ctx.res.attachment('orders.csv');

    ctx.res.send(ctx.result.csv);
  });

  Purchaseorderrow.CSVExport = function(cb) {
    var toCSV = Promise.promisify(require('json2csv'));
    var app = require('../../server/server');
    var Purchaseorder = app.models.Purchaseorder;
    var Costcenter = app.models.Costcenter;
    var Title = app.models.Title;
    var Titlegroup = app.models.Titlegroup;
    var Delivery = app.models.Delivery;
    var Purchaseuser = app.models.Purchaseuser;
    var findAllOrderrows = Promise.promisify(Purchaseorderrow.find, Purchaseorderrow);
    var findOrder = Promise.promisify(Purchaseorder.findById, Purchaseorder);
    var findTitle = Promise.promisify(Title.findById, Title);
    var findTitlegroup = Promise.promisify(Titlegroup.findById, Titlegroup);
    var findDelivery = Promise.promisify(Delivery.findById, Delivery);
    var findCostcenter = Promise.promisify(Costcenter.findById, Costcenter);
    var findPurchaseuser = Promise.promisify(Purchaseuser.findById, Purchaseuser);
    var findOrderrows = findAllOrderrows();

    function couldNotFindModelWithId(model, id) {
      var err = new Error('Could not find ' + model + ' with id ' + id);
      err.status = 422;
      throw err;
    }

    function replaceOrderIdWithNameAndAddCostCenterAndEmail(orderrow) {
      return findOrder(orderrow.orderId).then(function(order) {
        if (order === null) {
          couldNotFindModelWithId('order', orderrow.orderId);
          return orderrow;
        } else {
          return findCostcenter(order.costcenterId).then(function(costcenter) {
            if (costcenter === null) {
              couldNotFindModelWithId('costcenter', order.costcenterId);
              return orderrow;
            } else {
              return findPurchaseuser(order.subscriberId).then(function(purchaseuser) {
                if (purchaseuser === null) {
                  couldNotFindModelWithId('purchaseuser', order.subscriberId);
                  return orderrow;
                } else {
                  var o = orderrow.toObject();
                  o.orderName = order.name;
                  o.costcenterCode = costcenter.code;
                  o.ordererEmail = purchaseuser.email;
                  return o;
                }
              });
            }
          });
        }
      });
    }

    function addTitleNameAndUnitAndPriceAndTitlegroupName(orderrow) {
      return findTitle(orderrow.titleId).then(function(title) {
        if (title === null) {
          couldNotFindModelWithId('title', orderrow.titleId);
          return orderrow;
        } else {
          return findTitlegroup(title.titlegroupId).then(function(titlegroup) {
            if (titlegroup === null) {
              couldNotFindModelWithId('titlegroup', title.titlegroupId);
              return orderrow;
            } else {
              orderrow.titlegroupName = titlegroup.name;
              if (title.titlegroupId === 0) { // Muu tuote: nimi ja yksikkö tilausrivistä
                orderrow.titleName = orderrow.nameOverride;
                orderrow.titleUnit = orderrow.unitOverride;
                orderrow.price = orderrow.priceOverride;
              } else {
                orderrow.titleName = title.name;
                orderrow.titleUnit = title.unit;
                orderrow.price = title.priceWithTax;
              }
              return orderrow;
            }
          });
        }
      });
    }

    function addDeliveryDescription(orderrow) {
      return findDelivery(orderrow.deliveryId).then(function(delivery) {
        if (delivery === null) {
          couldNotFindModelWithId('delivery', orderrow.deliveryId);
          return orderrow;
        } else {
          orderrow.deliveryDescription = delivery.description;
          return orderrow;
        }
      });
    }

    function orderrowsToCSV(orderrows) {
      var fields = [ 'orderRowId', 'titlegroupName',	'titleId',	'titleName', 'amount',	'titleUnit', 'price',	'deliveryDescription',	'costcenterCode',	'orderName', 'ordererEmail',	'confirmed',	'providerApproval',	'controllerApproval',	'userSectionApproval',	'ordered',	'purchaseOrderNumber',	'requestService',	'delivered',	'modified',	'memo' ];
      return toCSV({ data: orderrows, fields: fields });
    }

    findOrderrows.map(replaceOrderIdWithNameAndAddCostCenterAndEmail)
    .map(addTitleNameAndUnitAndPriceAndTitlegroupName)
    .map(addDeliveryDescription)
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

  Purchaseorderrow.beforeRemote('getUsersCostcentersWithOrders', function(ctx, orderrow, next) {
    ctx.args.userId = ctx.req.accessToken.userId;
    next();
  });

  Purchaseorderrow.getUsersCostcentersWithOrders = function(userId, cb) {
    var User = app.models.Purchaseuser;
    var findUserById = Promise.promisify(User.findById, User);
    var filter = {
      fields: ['id'],
      include: {
        relation: 'costcenters',
        scope: {
          include: {
            relation: 'orders',
            scope: {
              include: {
                relation: 'order_rows',
              },
            },
          },
        },
      },
    };
    var orders = [];

    findUserById(userId, filter)
    .then(function(user) {
      user = user.toObject();
      return user.costcenters;
    }).map(function(costcenter) {
      for (var i = 0; i < costcenter.orders.length; i++) {
        orders.push(costcenter.orders[i]);
      }
    }).then(function() {
      cb(null, orders);
    }).catch(function(error) {
      cb(error);
    });
  };

  Purchaseorderrow.remoteMethod(
    'getUsersCostcentersWithOrders',
    {
      http: { path: '/getUsersCostcentersWithOrders', verb: 'get' },
      accepts: { arg: 'userId', type: 'string', 'http': { source: 'req' } },
      returns: { arg: 'orders', type: 'Array' },
    }
  );
};
