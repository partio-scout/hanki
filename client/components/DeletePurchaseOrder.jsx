var _ = require('lodash');
var React = require('react');
var connectToStores = require('alt/utils/connectToStores');
var ConfirmDeleteDialog = require('./utils/ConfirmDeleteDialog.jsx');
var Router = require('react-router');

var getDeletePurchaseOrder = function(PurchaseOrderActions, PurchaseOrderStore) {
  var deletePurchaseOrder = React.createClass({
    mixins: [ Router.Navigation ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore ]
      },

      getPropsFromStores() {
        return PurchaseOrderStore.getState()
      }
    },

    getDefaultProps: function() {
      return {
        myPurchaseOrders: { }
      }
    },

    onHide: function() {
      this.transitionTo('my_purchase_orders');
    },

    onConfirm: function() {
      var order = this.props.myPurchaseOrders[this.props.params.purchaseOrder];
      PurchaseOrderActions.deletePurchaseOrder(order);
      this.transitionTo('my_purchase_orders');
    },

    render: function() {
      var order = this.props.myPurchaseOrders[this.props.params.purchaseOrder] || { };
      return (
        <ConfirmDeleteDialog title="Poista tilaus" onHide={ this.onHide } onConfirm={ this.onConfirm }>
          Haluatko varmasti poistaa tilauksen "{ order.name }"?
        </ConfirmDeleteDialog>
      );
    }
  });

  return connectToStores(deletePurchaseOrder);
};

module.exports = getDeletePurchaseOrder;
