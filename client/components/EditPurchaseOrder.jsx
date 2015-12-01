var React = require('react');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');

var PurchaseOrderForm = require('./PurchaseOrderForm');

var validatePurchaseOrder = require('../validation/purchaseOrder');

var connectToStores = require('alt/utils/connectToStores');

var getEditPurchaseOrder = function(PurchaseOrderActions, CostCenterStore, PurchaseOrderStore) {
  var EditPurchaseOrder = React.createClass({
    propTypes: {
      params: React.PropTypes.object,
      costCenters: React.PropTypes.object,
    },

    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    statics: {
      getStores() {
        return [ CostCenterStore ];
      },

      getPropsFromStores() {
        return {
          costCenters: CostCenterStore.getState(),
        };
      },
    },

    transformState: function(state) {
      var orders = state.myPurchaseOrders || { };
      var purchaseOrder = orders[this.props.params.purchaseOrder] || { };
      return purchaseOrder;
    },

    getInitialState: function() {
      return this.transformState(PurchaseOrderStore.getState());
    },

    componentDidMount: function() {
      PurchaseOrderStore.listen(this.onOrderChange);
    },

    componentWillUnmount: function() {
      PurchaseOrderStore.unlisten(this.onOrderChange);
    },

    onOrderChange: function(state) {
      this.setState(this.transformState(state));
    },

    onCancel: function() {
      this.transitionTo('my_purchase_orders');
    },

    onSave: function() {
      var purchaseOrder = {
        orderId: this.state.orderId,
        name: this.state.name,
        costcenterId: this.state.costcenterId,
      };

      var validationErrors = validatePurchaseOrder(purchaseOrder);

      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        PurchaseOrderActions.updatePurchaseOrder(purchaseOrder);
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
          title="Muokkaa tilausta"
          costCenters={ this.props.costCenters.costCenters }
          onSave={ this.onSave }
          onCancel={ this.onCancel }
          valueLinks={ valueLinks }
          validationErrors={ this.state.validationErrors }
        />
      );
    },
  });

  return connectToStores(EditPurchaseOrder);
};

module.exports = getEditPurchaseOrder;
