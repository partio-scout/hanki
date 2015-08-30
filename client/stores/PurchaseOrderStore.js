function getPurchaseOrderStore(alt, PurchaseOrderActions) {
  class PurchaseOrderStore {
    constructor() {
      this.bindListeners({
        handleUpdateMyPurchaseOrders: PurchaseOrderActions.UPDATE_MY_PURCHASE_ORDERS
      });
    }

    handleUpdateMyPurchaseOrders(myPurchaseOrders) {
      this.myPurchaseOrders = myPurchaseOrders;
    }
  }

  return alt.createStore(PurchaseOrderStore, 'PurchaseOrderStore');
}

module.exports = getPurchaseOrderStore;
