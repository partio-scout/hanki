var React = require('react');

var connectToStores = require('alt/utils/connectToStores');

var ConfirmDeleteDialog = require('./utils/ConfirmDeleteDialog');

var Router = require('react-router');

var getDeletePurchaseOrderRow = function(PurchaseOrderActions, PurchaseOrderStore, TitleStore) {
  var deletePurchaseOrderRow = React.createClass({
    propTypes: {
      titles: React.PropTypes.object,
      purchaseOrders: React.PropTypes.object,
      params: React.PropTypes.object,
    },

    mixins: [ Router.Navigation ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore, TitleStore ];
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          titles: TitleStore.getState(),
        };
      },
    },

    onHide: function() {
      this.goBack();
    },

    onConfirm: function() {
      var rowId = this.props.params.purchaseOrderRow;
      var row = this.props.purchaseOrders.purchaseOrderRows[rowId];
      PurchaseOrderActions.deletePurchaseOrderRow(row);
      this.goBack();
    },

    render: function() {
      var rowId = this.props.params.purchaseOrderRow;
      var row = this.props.purchaseOrders.purchaseOrderRows[rowId] || { };
      var title = this.props.titles.titles[row && row.titleId] || { };

      if (row.prohibitChanges) {
        return null;
      }

      return (
        <ConfirmDeleteDialog title="Poista tuote" onHide={ this.onHide } onConfirm={ this.onConfirm }>
          Haluatko varmasti poistaa tuotteen "{ row.nameOverride && 'Muu: ' + row.nameOverride || title.name } ({ row.amount } { row.unitOverride || title.unit })" tilauksestasi?
        </ConfirmDeleteDialog>
      );
    },
  });

  return connectToStores(deletePurchaseOrderRow);
};

module.exports = getDeletePurchaseOrderRow;
