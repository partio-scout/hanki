var _ = require('lodash');

module.exports = function(Externalorder) {
  Externalorder.afterRemote('*', function(ctx, exOrder, next) {
    if (ctx.result) {
      if (_.isArray(ctx.result)) {
        ctx.result = _.map(ctx.result, function(order) {
          order = order.toObject();
          order.externalorderCode = _.padLeft(order.externalorderId, 5, '0');
          return order;
        });
        next();
      } else {
        ctx.result = ctx.result.toObject();
        ctx.result.externalorderCode = _.padLeft(ctx.result.externalorderId, 5, '0');
        next();
      }
    }
  });
};
