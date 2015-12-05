var React = require('react');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');
var PurchaseOrderForm = require('./PurchaseOrderForm');

var validatePurchaseOrder = require('../validation/purchaseOrder');

var getNewPurchaseOrder = function(PurchaseOrderActions, CostCenterStore) {
  return React.createClass({
    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    getInitialState() {
      return CostCenterStore.getState();
    },

    componentDidMount() {
      CostCenterStore.listen(this.onChange);
    },

    componentDidUnmount() {
      CostCenterStore.listen(this.onChange);
    },

    onChange(state) {
      this.setState(state);
    },

    onCancel: function() {
      this.transitionTo('my_purchase_orders');
    },

    onSave: function() {
      var purchaseOrder = {
        name: this.state.name,
        costcenterId: this.state.costcenterId,
      };

      var validationErrors = validatePurchaseOrder(purchaseOrder);

      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        PurchaseOrderActions.createPurchaseOrder(purchaseOrder);
        this.transitionTo('my_purchase_orders');
      }
    },

    render: function () {
      var valueLinks = {
        name: this.linkState('name'),
        costcenterId: this.linkState('costcenterId'),
      };

      return (
        <PurchaseOrderForm
          title="Uusi tilaus"
          costCenters={ this.state.costCenters }
          onSave={ this.onSave }
          onCancel={ this.onCancel }
          valueLinks={ valueLinks }
          validationErrors={ this.state.validationErrors }
        />
      );
    },
  });
};

module.exports = getNewPurchaseOrder;
