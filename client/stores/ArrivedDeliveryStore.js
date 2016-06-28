function getArrivedDeliveryStore(alt, ArrivedDeliveryActions) {
  class ArrivedDeliveryStore {
    constructor() {
      this.arrivedDeliveries = [ ];
      this.arrivedDeliveryRows = [ ];

      this.bindListeners({
        handleUpdateArrivedDeliveries: ArrivedDeliveryActions.UPDATE_ARRIVED_DELIVERIES,
        handleUpdateArrivedDeliveryRows: ArrivedDeliveryActions.UPDATE_ARRIVED_DELIVERY_ROWS,
      });
    }

    handleUpdateArrivedDeliveries(deliveries) {
      this.arrivedDeliveries = deliveries;
    }

    handleUpdateArrivedDeliveryRows(rows) {
      this.arrivedDeliveryRows = rows;
    }
  }

  return alt.createStore(ArrivedDeliveryStore, 'ArrivedDeliveryStore');
}

module.exports = getArrivedDeliveryStore;
