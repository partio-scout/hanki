var React = require('react');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');

var ExternalOrderForm = require('./ExternalOrderForm');

var validateExternalOrder = require('../validation/externalorder');

module.exports = function getEditExternalOrder(ExternalOrderActions, ExternalOrderStore) {
  return React.createClass({
    propTypes: {
      params: React.PropTypes.object,
    },

    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    getInitialState: function() {
      return this.transformState(ExternalOrderStore.getState());
    },

    transformState: function (externalOrderStoreState) {
      const externalOrders = externalOrderStoreState.externalOrders || { };
      let state = externalOrders[this.props.params.externalorderId] || { };
      state.validationErrors = [];
      return state;
    },

    componentDidMount: function() {
      ExternalOrderStore.listen(this.onExternalOrderStoreChange);
    },

    componentWillUnmount: function() {
      ExternalOrderStore.unlisten(this.onExternalOrderStoreChange);
    },

    onExternalOrderStoreChange: function(state) {
      this.setState(this.transformState(state));
    },

    onCancel: function() {
      this.transitionTo('external_orders');
    },

    getExternalOrderFromState() {
      return {
        supplierName: this.state.supplierName,
        externalorderId: this.state.externalorderId,
        businessId: this.state.businessId,
        contactPerson: this.state.contactPerson,
        email: this.state.email,
        phone: this.state.phone,
        customerNumber: this.state.customerNumber,
        deliveryTime: this.state.deliveryTime,
        deliveryAddress: this.state.deliveryAddress,
        methodOfDelivery: this.state.methodOfDelivery,
        termsOfDelivery: this.state.termsOfDelivery,
        termsOfPayment: this.state.termsOfPayment,
        reference: this.state.reference,
        memo: this.state.memo,
      };
    },

    onSave: function() {
      const newExternalOrder = this.getExternalOrderFromState();

      const validationErrors = validateExternalOrder(newExternalOrder);

      this.setState({ validationErrors });

      if (validationErrors.length === 0) {
        ExternalOrderActions.updateExternalOrder(newExternalOrder);
        this.transitionTo('external_orders');
      }
    },

    render() {
      const valueLinks = {
        supplierName: this.linkState('supplierName'),
        externalorderId: this.linkState('externalorderId'),
        businessId: this.linkState('businessId'),
        contactPerson: this.linkState('contactPerson'),
        email: this.linkState('email'),
        phone: this.linkState('phone'),
        customerNumber: this.linkState('customerNumber'),
        deliveryTime: this.linkState('deliveryTime'),
        deliveryAddress: this.linkState('deliveryAddress'),
        methodOfDelivery: this.linkState('methodOfDelivery'),
        termsOfDelivery: this.linkState('termsOfDelivery'),
        termsOfPayment: this.linkState('termsOfPayment'),
        reference: this.linkState('reference'),
        memo: this.linkState('memo'),
      };
      return (
        <ExternalOrderForm
          formTitle="Muokkaa ulkoista tilausta"
          validationErrors={ this.state.validationErrors }
          onSave={ this.onSave }
          onCancel={ this.onCancel }
          valueLinks={ valueLinks }
          canEditId={ false }
        />
      );
    },
  });
};
