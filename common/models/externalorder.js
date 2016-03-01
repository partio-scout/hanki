var _ = require('lodash');

module.exports = function(Externalorder) {
  Externalorder.afterRemote('*', function(ctx, exOrder, next) {
    function pad(str, max) {
      str = str.toString();
      return str.length < max ? pad("0" + str, max) : str;
    }

    if (ctx.result) {
      if (_.isArray(ctx.result)) {
        ctx.result = _.map(ctx.result, function(order) {
          order = order.toObject();
          order.externalorderId = pad(order.externalorderId, 4);
          return order;
        });
        next();
      } else {
        ctx.result = ctx.result.toObject();
        ctx.result.externalorderId = pad(ctx.result.externalorderId, 4);
        next();
      }
    }
  });
};
