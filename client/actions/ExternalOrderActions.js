var _ = require('lodash');

function getExternalOrderActions(alt, ExternalOrder, PurchaseOrderRow, PurchaseOrderActions) {
  class ExternalOrderActions {

    externalOrderError(error) {
      this.dispatch(error);
    }

    updateExternalOrders(externalOrders) {
      this.dispatch(externalOrders);
      PurchaseOrderActions.fetchAllPurchaseOrders();
    }

    fetchExternalOrders() {
      this.dispatch();
      ExternalOrder.findAll((err, externalOrders) => {
        if (err) {
          this.actions.externalOrderError(err);
        } else {
          this.actions.updateExternalOrders(_.indexBy(externalOrders, 'externalorderId'));
        }
      }, 'filter={"include":{"relation":"order_rows","scope":{"fields":["orderRowId"]}}}');
    }

    createExternalOrder(externalOrder) {
      this.dispatch(externalOrder);
      ExternalOrder.create(externalOrder, (err) => {
        if (err) {
          this.actions.externalOrderError(err);
        } else {
          this.actions.fetchExternalOrders();
        }
      });
    }

    updateExternalOrder(externalOrder) {
      this.dispatch(externalOrder);
      ExternalOrder.update(externalOrder.externalorderId, externalOrder, (err, savedExternalOrder) => {
        if (err) {
          this.actions.externalOrderError(err);
        } else {
          this.actions.fetchExternalOrders();
        }
      });
    }

    deleteExternalOrder(externalOrder) {
      ExternalOrder.del(externalOrder.externalorderId, (err, deletedOrder) => {
        if (err) {
          this.actions.externalOrderError(err);
        } else {
          this.actions.fetchExternalOrders();
        }
      });
    }

    externalOrderRowUpdateFailed(err) {
      this.dispatch(err);
    }

    updatePurchaseOrderRow(row) {
      this.dispatch(row);
      PurchaseOrderRow.update(row.orderRowId, row, (err, purchaseOrderRow) => {
        if (err) {
          this.actions.externalOrderRowUpdateFailed(err);
        } else {
          PurchaseOrderActions.purchaseOrderRowUpdated(purchaseOrderRow);
          this.actions.fetchExternalOrders();
        }
      });
    }

  }
  return alt.createActions(ExternalOrderActions);
}

module.exports = getExternalOrderActions;
