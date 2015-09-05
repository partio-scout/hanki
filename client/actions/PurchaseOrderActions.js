function getPurchaseOrderActions(alt, PurchaseOrder, PurchaseOrderRow) {
  class PurchaseOrderActions {

    updateMyPurchaseOrders(myPurchaseOrders) {
      this.dispatch(myPurchaseOrders);
    }

    updatePurchaseOrderRows(myPurchaseOrders) {
      this.dispatch(myPurchaseOrders);
    }

    loadingMyPurchaseOrdersFailed(error) {
      this.dispatch(error);
    }

    fetchMyPurchaseOrders(userId) {
      this.dispatch();

      PurchaseOrder.findAll((err, res) => {
        if (err) {
          this.actions.loadingMyPurchaseOrdersFailed(err);
        } else {
          this.actions.updateMyPurchaseOrders(res);
        }
      }, 'filter[order]=orderId%20DESC');

      PurchaseOrderRow.findAll((err, res) => {
        if (err) {
          this.actions.loadingMyPurchaseOrdersFailed(err);
        } else {
          this.actions.updatePurchaseOrderRows(res);
        }
      }, 'filter[order]=orderId%20DESC');
    }

    creatingPurchaseOrderFailed(error) {
      this.dispatch(error);
    }

    purchaseOrderCreated(purchaseOrder) {
      this.dispatch(purchaseOrder);
    }

    creatingPurchaseOrderRowFailed(error) {
      this.dispatch(error);
    }

    purchaseOrderRowCreated(row) {
      this.dispatch(row);
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

    createPurchaseOrderRow(row) {
      this.dispatch(row);
      PurchaseOrderRow.create(row, (err, savedRow) => {
        if (err) {
          this.actions.creatingPurchaseOrderRowFailed(err);
        } else {
          this.actions.purchaseOrderRowCreated(savedRow);
        }
      });
    }
  }
  return alt.createActions(PurchaseOrderActions);
}

module.exports = getPurchaseOrderActions;
