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
      }, 'filter[order]=orderId%20DESC');
    }

    creatingPurchaseOrderFailed(error) {
      this.dispatch(error);
    }

    purchaseOrderCreated(purchaseOrder) {
      this.dispatch(purchaseOrder);
    }

    createPurchaseOrder(purchaseOrder) {
      this.dispatch(purchaseOrder);
      PurchaseOrder.create(purchaseOrder, (err, savedPurchaseOrder) => {
        if (err) {
          this.actions.creatingPurchaseOrderFailed(err);
        } else {
          this.actions.purchaseOrderCreated(savedPurchaseOrder);
        }
      });
    }
  }
  return alt.createActions(PurchaseOrderActions);
}

module.exports = getPurchaseOrderActions;
