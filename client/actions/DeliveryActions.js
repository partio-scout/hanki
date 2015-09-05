var _ = require('lodash');

function getDeliveryActions(alt, Delivery) {
  class DeliveryActions {
    updateDeliveries(deliveries) {
      this.dispatch(deliveries);
    }

    deliveryUpdateFailed(error) {
      this.dispatch(error);
    }

    fetchDeliveries() {
      this.dispatch();
      Delivery.findAll((err, deliveries) => {
        if (err) {
          this.actions.deliveryUpdateFailed(null);
        } else {
          this.actions.updateDeliveries(_.indexBy(deliveries, 'deliveryId'));
        }
      });
    }
  }
  return alt.createActions(DeliveryActions);
}

module.exports = getDeliveryActions;
