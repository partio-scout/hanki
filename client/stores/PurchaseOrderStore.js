function getPurchaseOrderStore(alt, PurchaseOrderActions) {
  class PurchaseOrderStore {
    constructor() {
      this.bindListeners({
        handleUpdateMyPurchaseOrders: PurchaseOrderActions.UPDATE_MY_PURCHASE_ORDERS,
        handlePurchaseOrderCreated: PurchaseOrderActions.PURCHASE_ORDER_CREATED
      });
    }

    handleUpdateMyPurchaseOrders(myPurchaseOrders) {
      this.myPurchaseOrders = myPurchaseOrders;
    }

    handlePurchaseOrderCreated(newPurchaseOrder) {
      this.myPurchaseOrders.unshift(newPurchaseOrder);
    }
  }

  return alt.createStore(PurchaseOrderStore, 'PurchaseOrderStore');
}

module.exports = getPurchaseOrderStore;
