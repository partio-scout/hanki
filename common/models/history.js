module.exports = function(History) {
  History.remember = {};
  History.remember.PurchaseOrder = function(ctx, purchaseorder, event_description) {
    History.create(
      {
        'userId': ctx.req.accessToken.userId,
        'eventtype': event_description,
        'comment': purchaseorder.name,
        'purchaseOrderId': purchaseorder.orderId,
        'timestamp':(new Date()).toISOString()
      },
      function(err,instance) {if (err) {throw err;} console.log(instance);}
    );
  };
};
