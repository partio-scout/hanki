module.exports = function(Purchaseorder) {
  Purchaseorder.beforeRemote('create', function(ctx, purchaseOrder, next) {
    ctx.args.data.subscriberId = ctx.req.accessToken.userId;
    next();
  });
};
