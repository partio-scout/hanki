function getExternalOrderStore(alt, ExternalOrderActions) {
  class ExternalOrderStore {
    constructor() {
      this.externalOrders = {};

      this.bindListeners({
        handleUpdateExternalOrders: ExternalOrderActions.UPDATE_EXTERNAL_ORDERS,
      });
    }

    handleUpdateExternalOrders(externalOrders) {
      this.externalOrders = externalOrders;
    }
  }
  return alt.createStore(ExternalOrderStore, 'ExternalOrderStore');
}

module.exports = getExternalOrderStore;
