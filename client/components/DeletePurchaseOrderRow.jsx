var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var connectToStores = require('alt/utils/connectToStores');

var ConfirmDeleteDialog = require('./utils/ConfirmDeleteDialog.jsx');

var Router = require('react-router');

var getDeletePurchaseOrderRow = function(PurchaseOrderActions, PurchaseOrderStore, TitleStore) {
  var deletePurchaseOrderRow = React.createClass({
    mixins: [ Router.Navigation ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore, TitleStore ]
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          titles: TitleStore.getState()
        }
      }
    },

    onHide: function() {
      this.transitionTo('my_purchase_orders');
    },

    onConfirm: function() {
      var rowId = this.props.params.purchaseOrderRow;
      var row = this.props.purchaseOrders.purchaseOrderRows[rowId];
      PurchaseOrderActions.deletePurchaseOrderRow(row);
      this.transitionTo('my_purchase_orders');
    },

    render: function() {
      var rowId = this.props.params.purchaseOrderRow;
      var row = this.props.purchaseOrders.purchaseOrderRows[rowId] || { };
      console.log(row, this.props)
      var title = this.props.titles.titles[row && row.titleId] || { };
      return (
        <ConfirmDeleteDialog title="Poista tuote" onHide={ this.onHide } onConfirm={ this.onConfirm }>
          Haluatko varmasti poistaa tuotteen "{ title.name } ({ row.amount } { title.unit })" tilauksestasi?
        </ConfirmDeleteDialog>
      );
    }
  });

  return connectToStores(deletePurchaseOrderRow);
};

module.exports = getDeletePurchaseOrderRow;
