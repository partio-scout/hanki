function getPurchaseOrderActions(alt, PurchaseOrder) {
  class PurchaseOrderActions {

    updateMyPurchaseOrders(myPurchaseOrders) {
      this.dispatch(myPurchaseOrders);
    }

    loadingMyPurchaseOrdersFailed(error) {
      this.dispatch(error);
    }

    fetchMyPurchaseOrders(userId) {
      this.dispatch();
      PurchaseOrder.findAll((err, res) => {
        if (err) {
          this.actions.loadingMyPurchaseOrdersFailed(err)
        } else {
          this.actions.updateMyPurchaseOrders(res);
        }
      });
    }
  }
  return alt.createActions(PurchaseOrderActions);
}

module.exports = getPurchaseOrderActions;
