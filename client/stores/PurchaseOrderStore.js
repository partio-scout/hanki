function getPurchaseOrderStore(alt, PurchaseOrderActions) {
  class PurchaseOrderStore {
    constructor() {
      this.purchaseOrderRows = { };

      this.bindListeners({
        handleUpdateMyPurchaseOrders: PurchaseOrderActions.UPDATE_MY_PURCHASE_ORDERS,
        handlePurchaseOrderCreated: PurchaseOrderActions.PURCHASE_ORDER_CREATED,
        handleUpdatePurchaseOrderRows: PurchaseOrderActions.UPDATE_PURCHASE_ORDER_ROWS,
        handlePurchaseOrderRowCreated: PurchaseOrderActions.PURCHASE_ORDER_ROW_CREATED,
        handlePurchaseOrderRowDeleted: PurchaseOrderActions.PURCHASE_ORDER_ROW_DELETED
      });
    }

    handleUpdateMyPurchaseOrders(myPurchaseOrders) {
      this.myPurchaseOrders = myPurchaseOrders;
    }

    handlePurchaseOrderCreated(newPurchaseOrder) {
      this.myPurchaseOrders.unshift(newPurchaseOrder);
    }

    handleUpdatePurchaseOrderRows(rows) {
      this.purchaseOrderRows = rows;
    }

    handlePurchaseOrderRowCreated(row) {
      this.purchaseOrderRows[row.orderRowId] = row;
      this.handleUpdatePurchaseOrderRows(this.purchaseOrderRows);
    }

    handlePurchaseOrderRowDeleted(deletedRow) {
      delete this.purchaseOrderRows[deletedRow.orderRowId];
      this.handleUpdatePurchaseOrderRows(this.purchaseOrderRows);
    }

  }

  return alt.createStore(PurchaseOrderStore, 'PurchaseOrderStore');
}

module.exports = getPurchaseOrderStore;
