module.exports = function(ArrivedDelivery) {
  ArrivedDelivery.beforeRemote('create', function(ctx, instance, next) {
    ctx.args.data.arrivalDate = ctx.args.data.arrivalDate || (new Date()).toISOString();
    next();
  });
};
