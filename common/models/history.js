module.exports = function(History) {
  History.remember = {};
  History.remember.PurchaseOrder = function(ctx, purchaseorder, event_description) {
    History.create(
      {
        'accountId': ctx.req.accessToken.userId,
        'eventtype': event_description,
        'comment': purchaseorder.name,
        'purchaseOrderId': purchaseorder.orderId,
        'purchaseOrderRowId': ctx.args.data.orderRowId,
        'timestamp':(new Date()).toISOString()
      },
      function(err,instance) {if (err) {throw err;} return;}
    );
  };
  History.remember.PurchaseOrderRow = function(ctx, purchaseorderrow, event_description) {
    History.create(
      {
        'accountId': ctx.req.accessToken.userId,
        'eventtype': event_description,
        'comment': '',
        'purchaseOrderId': purchaseorderrow.orderId,
        'purchaseOrderRowId': purchaseorderrow.orderRowId,
        'timestamp':(new Date()).toISOString()
      },
      function(err,instance) {if (err) {throw err;} return;}
    );
  };
};
