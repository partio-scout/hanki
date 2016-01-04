var _ = require('lodash');

function getPurchaseOrderActions(alt, PurchaseOrder, PurchaseOrderRow, MyPurchaseOrder) {
  class PurchaseOrderActions {

    // Fetching orders and rows

    fetchMyPurchaseOrders(userId) {
      this.dispatch();

      MyPurchaseOrder.findAll((err, res) => {
        if (err) {
          this.actions.loadingMyPurchaseOrdersFailed(err);
        } else {
          var purchaseOrders = _.indexBy(res, 'orderId');
          this.actions.updateMyPurchaseOrders(purchaseOrders);
        }
      }, 'filter[order]=orderId%20DESC');

      MyPurchaseOrder.findAll((err, res) => {
        if (err) {
          this.actions.loadingMyPurchaseOrdersFailed(err);
        } else {
          var orderRows = _(res).pluck('order_rows').flatten().indexBy('orderRowId').value();
          this.actions.updatePurchaseOrderRows(orderRows);
        }
      }, 'filter[order]=orderId%20DESC&filter[include]=order_rows');
    }

    loadingMyPurchaseOrdersFailed(error) {
      this.dispatch(error);
    }

    updateMyPurchaseOrders(myPurchaseOrders) {
      this.dispatch(myPurchaseOrders);
    }

    updatePurchaseOrderRows(myPurchaseOrders) {
      this.dispatch(myPurchaseOrders);
    }

    // Creating & updating orders

    createPurchaseOrder(purchaseOrder) {
      this.dispatch(purchaseOrder);
      PurchaseOrder.create(purchaseOrder, (err, savedPurchaseOrder) => {
        if (err) {
          this.actions.savingPurchaseOrderFailed(err);
        } else {
          this.actions.purchaseOrderCreated(savedPurchaseOrder);
        }
      });
    }

    updatePurchaseOrder(purchaseOrder) {
      this.dispatch(purchaseOrder);
      PurchaseOrder.update(purchaseOrder.orderId, purchaseOrder, (err, savedPurchaseOrder) => {
        if (err) {
          this.actions.savingPurchaseOrderFailed(err);
        } else {
          this.actions.purchaseOrderUpdated(savedPurchaseOrder);
        }
      });
    }

    savingPurchaseOrderFailed(error) {
      this.dispatch(error);
    }

    purchaseOrderCreated(purchaseOrder) {
      this.dispatch(purchaseOrder);
    }

    purchaseOrderUpdated(purchaseOrder) {
      this.dispatch(purchaseOrder);
    }

    // Deleting purchase orders

    deletePurchaseOrder(purchaseOrder) {
      PurchaseOrder.del(purchaseOrder.orderId, (err, deletedOrder) => {
        if (err) {
          this.actions.deletingPurchaseOrderFailed(err);
        } else {
          this.actions.purchaseOrderDeleted(purchaseOrder);
        }
      });
    }

    deletingPurchaseOrderFailed(error) {
      this.dispatch(error);
    }

    purchaseOrderDeleted(purchaseOrder) {
      this.dispatch(purchaseOrder);
    }

    // Creating and updating rows

    createPurchaseOrderRow(row) {
      this.dispatch(row);
      PurchaseOrderRow.create(row, (err, savedRow) => {
        if (err) {
          this.actions.savingPurchaseOrderRowFailed(err);
        } else {
          this.actions.purchaseOrderRowCreated(savedRow);
        }
      });
    }

    updatePurchaseOrderRow(row) {
      this.dispatch(row);
      PurchaseOrder.rawWithBody('PUT', row.orderId + '/order_rows/' + row.orderRowId, row, (err, savedRow) => {
        if (err) {
          this.actions.savingPurchaseOrderRowFailed(err);
        } else {
          this.actions.purchaseOrderRowUpdated(savedRow);
        }
      });
    }

    savingPurchaseOrderRowFailed(error) {
      this.dispatch(error);
    }

    purchaseOrderRowCreated(row) {
      this.dispatch(row);
    }

    purchaseOrderRowUpdated(row) {
      this.dispatch(row);
    }

    // Deleting rows

    deletePurchaseOrderRow(row) {
      // Delete row via purchase order endpoint
      PurchaseOrder.raw('DELETE', row.orderId + '/order_rows/' + row.orderRowId, (err, deletedRow) => {
        if (err) {
          this.actions.deletingPurchaseOrderRowFailed(err);
        } else {
          this.actions.purchaseOrderRowDeleted(row);
        }
      });
    }

    purchaseOrderRowDeleted(row) {
      this.dispatch(row);
    }

    deletingPurchaseOrderRowFailed(err) {
      this.dispatch(err);
    }
  }
  return alt.createActions(PurchaseOrderActions);
}

module.exports = getPurchaseOrderActions;
