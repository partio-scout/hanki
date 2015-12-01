function getDeliveryStore(alt, DeliveryActions) {
  class DeliveryStore {
    constructor() {
      this.deliveries = [ ];

      this.bindListeners({
        handleUpdateDeliveries: DeliveryActions.UPDATE_DELIVERIES,
      });
    }

    handleUpdateDeliveries(deliveries) {
      this.deliveries = deliveries;
    }
  }

  return alt.createStore(DeliveryStore, 'DeliveryStore');
}

module.exports = getDeliveryStore;
