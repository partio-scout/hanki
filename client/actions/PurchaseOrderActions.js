function getPurchaseOrderActions(alt, PurchaseOrder) {
  class PurchaseOrderActions {
    updateMyPurchaseOrders(myPurchaseOrders) {
      this.dispatch(myPurchaseOrders);
    }

    fetchMyPurchaseOrders(userId) {
      this.dispatch();
      setTimeout(function() {
        this.actions.updateMyPurchaseOrders([
          {
            name: 'Test purchase order :)'
          }
        ]);
      }, 300);
    }
  }
  return alt.createActions(PurchaseOrderActions);
}

module.exports = getPurchaseOrderActions;
