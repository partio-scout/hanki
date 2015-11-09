module.exports = function(History) {
  History.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.timestamp = (new Date()).toISOString();
    next();
  });
};
