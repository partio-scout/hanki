var _ = require('lodash');

function getArrivedDeliveryActions(alt, ArrivedDelivery, ArrivedDeliveryRow) {
  class ArrivedDeliveryActions {
    updateArrivedDeliveries(arrivedDeliveries) {
      this.dispatch(arrivedDeliveries);
    }

    updateArrivedDeliveryRows(rows) {
      this.dispatch(rows);
    }

    arrivedDeliveryUpdateFailed(error) {
      this.dispatch(error);
    }

    fetchArrivedDeliveries() {
      this.dispatch();
      ArrivedDelivery.findAll((err, deliveries) => {
        if (err) {
          this.actions.arrivedDeliveryUpdateFailed(err);
        } else {
          this.actions.updateArrivedDeliveries(_.indexBy(deliveries, 'arrivedDeliveryId'));
        }
      });

      ArrivedDeliveryRow.findAll((err, deliveryRows) => {
        if (err) {
          this.actions.arrivedDeliveryUpdateFailed(err);
        } else {
          this.actions.updateArrivedDeliveryRows(_.indexBy(deliveryRows, 'arrivedDeliveryRowId'));
        }
      });
    }
  }
  return alt.createActions(ArrivedDeliveryActions);
}

module.exports = getArrivedDeliveryActions;
