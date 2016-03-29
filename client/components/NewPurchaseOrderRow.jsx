var React = require('react');
var ReactAddons = require('react/addons').addons;
var PurchaseOrderRowForm = require('./PurchaseOrderRowForm');

var validatePurchaseOrderRow = require('../validation/purchaseOrderRow');

var connectToStores = require('alt/utils/connectToStores');

var Router = require('react-router');

var getNewPurchaseOrderRow = function(PurchaseOrderActions, PurchaseOrderStore, TitleStore, DeliveryStore) {
  var newPurchaseOrderRow = React.createClass({
    propTypes: {
      purchaseOrders: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
      params: React.PropTypes.object,
    },

    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore, TitleStore, DeliveryStore ];
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          titles: TitleStore.getState(),
          deliveries: DeliveryStore.getState(),
        };
      },
    },

    isOtherProductSelected: function() {
      return 1 * this.state.selectedTitleGroup === 0;
    },

    getInitialState: function() {
      return {
        selectedTitleGroup: -1,
        selectedTitleId: -1,
        amount: 0,
        memo: '',
        deliveryId: 0,
        nameOverride: '',
        priceOverride: 0,
        requestService: false,
        validationErrors: [ ],
      };
    },

    onCancel: function() {
      this.goBack();
    },

    onSave: function() {
      var row = {
        titleId: this.state.selectedTitleId,
        amount: this.state.amount,
        approved: false,
        deliveryId: this.state.delivery,
        memo: this.state.memo,
        orderId: this.props.params.purchaseOrder,
        requestService: this.state.requestService,
      };

      if (this.isOtherProductSelected()) {
        row.titleId = 0;
        row.nameOverride = this.state.nameOverride;
        row.priceOverride = this.state.priceOverride;
        row.unitOverride = this.state.unitOverride;
      }

      var validationErrors = validatePurchaseOrderRow(row);

      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        PurchaseOrderActions.createPurchaseOrderRow(row);
        this.goBack();
      }
    },

    render: function () {
      var valueLinks = {
        selectedTitleGroup: this.linkState('selectedTitleGroup'),
        selectedTitleId: this.linkState('selectedTitleId'),
        nameOverride: this.linkState('nameOverride'),
        priceOverride: this.linkState('priceOverride'),
        unitOverride: this.linkState('unitOverride'),
        amount: this.linkState('amount'),
        delivery: this.linkState('delivery'),
        memo: this.linkState('memo'),
        requestService: this.linkState('requestService'),
      };

      return (
        <PurchaseOrderRowForm
          title="Lisää tuote"
          purchaseOrders={ this.props.purchaseOrders.purchaseOrders }
          titleGroups={ this.props.titles.titleGroups }
          titles={ this.props.titles.titles }
          deliveries={ this.props.deliveries.deliveries }
          valueLinks={ valueLinks }
          validationErrors={ this.state.validationErrors }
          onSave={ this.onSave }
          onCancel={ this.onCancel }
        />
      );
    },
  });

  return connectToStores(newPurchaseOrderRow);
};

module.exports = getNewPurchaseOrderRow;
