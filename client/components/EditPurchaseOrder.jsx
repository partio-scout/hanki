var _ = require('lodash');
var React = require('react');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');

var PurchaseOrderForm = require('./PurchaseOrderForm.jsx');

var connectToStores = require('alt/utils/connectToStores');

var getEditPurchaseOrder = function(PurchaseOrderActions, CostCenterStore, PurchaseOrderStore) {
  var EditPurchaseOrder = React.createClass({
    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    statics: {
      getStores() {
        return [ CostCenterStore ]
      },

      getPropsFromStores() {
        return {
          costCenters: CostCenterStore.getState(),
        }
      }
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
        costcenterId: this.state.costcenterId
      }
      PurchaseOrderActions.updatePurchaseOrder(purchaseOrder);
      this.transitionTo('my_purchase_orders');
    },

    render: function () {
      var valueLinks = {
        name: this.linkState('name'),
        costcenterId: this.linkState('costcenterId')
      }

      return (
        <PurchaseOrderForm
          title="Muokkaa tilausta"
          costCenters={ this.props.costCenters.costCenters }
          onSave={ this.onSave }
          onCancel={ this.onCancel }
          valueLinks={ valueLinks } />
      );
    }
  });

  return connectToStores(EditPurchaseOrder);
};

module.exports = getEditPurchaseOrder;
