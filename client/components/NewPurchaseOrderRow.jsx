var _ = require('lodash');
var React = require('react');
var ReactAddons = require('react/addons').addons;
var PurchaseOrderRowForm = require('./PurchaseOrderRowForm.jsx')

var validatePurchaseOrderRow = require('../validation/purchaseOrderRow');

var connectToStores = require('alt/utils/connectToStores');

var Router = require('react-router');

var getNewPurchaseOrderRow = function(PurchaseOrderActions, PurchaseOrderStore, TitleStore, DeliveryStore) {
  var newPurchaseOrderRow = React.createClass({
    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore, TitleStore, DeliveryStore ]
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          titles: TitleStore.getState(),
          deliveries: DeliveryStore.getState()
        }
      }
    },

    getInitialState: function() {
      return {
        selectedTitleId: '',
        amount: 0,
        validationErrors: [ ]
      }
    },

    onCancel: function() {
      this.transitionTo('my_purchase_orders');
    },

    onSave: function() {
      var row = {
        titleId: this.state.selectedTitleId,
        amount: this.state.amount,
        approved: false,
        deliveryId: this.state.delivery,
        memo: this.state.memo,
        orderId: this.props.params.purchaseOrder
      }

      var validationErrors = validatePurchaseOrderRow(row);

      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        PurchaseOrderActions.createPurchaseOrderRow(row);
        this.transitionTo('my_purchase_orders');
      }
    },

    render: function () {
      var valueLinks = {
        selectedTitleGroup: this.linkState('selectedTitleGroup'),
        selectedTitleId: this.linkState('selectedTitleId'),
        amount: this.linkState('amount'),
        delivery: this.linkState('delivery'),
        memo: this.linkState('memo')
      };

      return (
        <PurchaseOrderRowForm
          purchaseOrders={ this.props.purchaseOrders.purchaseOrders }
          titleGroups={ this.props.titles.titleGroups }
          titles={ this.props.titles.titles }
          deliveries={ this.props.deliveries.deliveries }
          valueLinks={ valueLinks }
          validationErrors={ this.state.validationErrors }
          onSave={ this.onSave }
          onCancel={ this.onCancel } />
      );
    }
  });

  return connectToStores(newPurchaseOrderRow);
};

module.exports = getNewPurchaseOrderRow;
