function getErrorStore(alt, ErrorActions, PurchaseOrderActions, DeliveryActions, CostCenterActions, TitleActions, ExternalOrderActions) {
  class ErrorStore {
    constructor() {
      this.errors = [ ];

      this.bindListeners({
        pushError: [
          PurchaseOrderActions.LOADING_PURCHASE_ORDERS_FAILED,
          PurchaseOrderActions.LOADING_MY_PURCHASE_ORDERS_FAILED,
          PurchaseOrderActions.SAVING_PURCHASE_ORDER_FAILED,
          PurchaseOrderActions.DELETING_PURCHASE_ORDER_FAILED,
          PurchaseOrderActions.SAVING_PURCHASE_ORDER_ROW_FAILED,
          PurchaseOrderActions.DELETING_PURCHASE_ORDER_ROW_FAILED,
          PurchaseOrderActions.ERROR,
          DeliveryActions.DELIVERY_UPDATE_FAILED,
          CostCenterActions.COST_CENTER_UPDATE_FAILED,
          TitleActions.TITLE_UPDATE_FAILED,
          TitleActions.TITLEGROUP_UPDATE_FAILED,
          TitleActions.SAVE_TITLE_FAILED,
          TitleActions.DELETE_TITLE_FAILED,
          ExternalOrderActions.EXTERNAL_ORDER_ERROR,
          ExternalOrderActions.EXTERNAL_ORDER_ROW_UPDATE_FAILED,
        ],
        popError: ErrorActions.CONFIRM_ERROR,
      });
    }

    pushError(error) {
      this.errors.push(error);
    }

    popError() {
      this.errors.pop();
    }

  }

  return alt.createStore(ErrorStore, 'ErrorStore');
}

module.exports = getErrorStore;
