var _ = require('lodash');

function getArrivedDeliveryActions(alt, ArrivedDelivery, ArrivedDeliveryRow, PurchaseOrderActions) {
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

    createArrivedDeliveryWithRows(delivery, rows) {
      this.dispatch();
      delivery.rows = rows;
      ArrivedDelivery.create(delivery, (err, delivery) => {
        if (err) {
          this.actions.arrivedDeliveryUpdateFailed(err);
        } else {
          var rows = _.map(delivery.rows, row => {
            row.arrivedDeliveryId = delivery.arrivedDeliveryId;
            return row;
          });
          ArrivedDeliveryRow.create(rows, (err, deliveryRows) => {
            if (err) {
              this.actions.arrivedDeliveryUpdateFailed(err);
            } else {
              this.actions.fetchArrivedDeliveries();
              PurchaseOrderActions.fetchAllPurchaseOrders();
            }
          });
        }
      });
    }
  }
  return alt.createActions(ArrivedDeliveryActions);
}

module.exports = getArrivedDeliveryActions;
