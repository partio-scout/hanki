var Promise = require('bluebird');
var app = require('../../server/server');
var loopback = require('loopback');

module.exports = function(Costcenter) {
  Costcenter.getUsersCostcentersWithOrders = function(cb) {
    // Get current user id from context
    var ctx = loopback.getCurrentContext();
    var accessToken = ctx.get('accessToken');
    var userId = accessToken.userId;

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

  Costcenter.remoteMethod(
    'getUsersCostcentersWithOrders',
    {
      http: { path: '/getUsersCostcentersWithOrders', verb: 'get' },
      returns: { arg: 'orders', type: 'Array' },
    }
  );
};
