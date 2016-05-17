var _ = require('lodash');

function getExternalOrderActions(alt, ExternalOrder) {
  class ExternalOrderActions {

    externalOrderError(error) {
      this.dispatch(error);
    }

    updateExternalOrders(externalOrders) {
      this.dispatch(externalOrders);
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

  }
  return alt.createActions(ExternalOrderActions);
}

module.exports = getExternalOrderActions;
