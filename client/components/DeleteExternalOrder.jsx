var React = require('react');
var connectToStores = require('alt/utils/connectToStores');
var ConfirmDeleteDialog = require('./utils/ConfirmDeleteDialog');
var Router = require('react-router');

var getDeleteExternalOrder = function(ExternalOrderActions, ExternalOrderStore) {
  var deleteExternalOrder = React.createClass({
    propTypes: {
      externalOrders: React.PropTypes.object,
      params: React.PropTypes.object,
    },

    mixins: [ Router.Navigation ],

    statics: {
      getStores() {
        return [ ExternalOrderStore ];
      },

      getPropsFromStores() {
        return ExternalOrderStore.getState();
      },
    },

    getDefaultProps: function() {
      return {
        externalOrders: { },
      };
    },

    onHide: function() {
      this.transitionTo('external_orders');
    },

    onConfirm: function() {
      var order = this.props.externalOrders[this.props.params.externalorderId];
      ExternalOrderActions.deleteExternalOrder(order);
      this.transitionTo('external_orders');
    },

    render: function() {
      var order = this.props.externalOrders[this.props.params.externalorderId] || { };
      return (
        <ConfirmDeleteDialog title="Poista ulkoinen tilaus" onHide={ this.onHide } onConfirm={ this.onConfirm }>
          Haluatko varmasti poistaa ulkoisen tilauksen "{ order.externalorderCode } { order.supplierName }"?
        </ConfirmDeleteDialog>
      );
    },
  });

  return connectToStores(deleteExternalOrder);
};

module.exports = getDeleteExternalOrder;
