var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;

var ReactRouterBootstrap = require('react-router-bootstrap');
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var PurchaseOrderRowTable = require('./PurchaseOrderRowTable');

var Price = require('./utils/Price');

function getPurchaseOrder(PurchaseOrderActions, PurchaseOrderRowTable, restrictToRoles) {
  var ApproversOnly = restrictToRoles(['controller', 'procurementMaster', 'procurementAdmin'], 'div');

  var PurchaseOrder = React.createClass({
    propTypes: {
      purchaseOrderRows: React.PropTypes.object,
      titles: React.PropTypes.object,
      costCenter: React.PropTypes.object,
      purchaseOrder: React.PropTypes.object,
      deliveries: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
    },

    getDefaultProps: function() {
      return {
        costCenter: { name: '...' },
        readOnly: false,
      };
    },

    getInitialState: function() {
      return {
        'controller': [],
        'procurement': [],
      };
    },

    clearSelections: function() {
      this.setState({
        'controller': [],
        'procurement': [],
      });
    },

    rowSelectionChanged: function(orderRowId, type, isChecked) {
      var stateChange = { };
      if (isChecked) {
        stateChange[type] = this.state[type].concat([ orderRowId ]);
      } else {
        stateChange[type] = _(this.state[type]).without(orderRowId).value();
      }
      this.setState(stateChange);
    },

    areRowsSelected: function() {
      return this.areRowsSelectedAs('controller') || this.areRowsSelectedAs('procurement');
    },

    areRowsSelectedAs: function(type) {
      return this.state[type] && this.state[type].length > 0;
    },

    acceptRows: function() {
      if (this.areRowsSelectedAs('controller')) {
        PurchaseOrderActions.acceptPurchaseOrderRows('controller', this.state.controller);
      }
      if (this.areRowsSelectedAs('procurement')) {
        PurchaseOrderActions.acceptPurchaseOrderRows('procurement', this.state.procurement);
      }
      this.clearSelections();
    },

    declineRows: function() {
      if (this.areRowsSelectedAs('controller')) {
        PurchaseOrderActions.declinePurchaseOrderRows('controller', this.state.controller);
      }
      if (this.areRowsSelectedAs('procurement')) {
        PurchaseOrderActions.declinePurchaseOrderRows('procurement', this.state.procurement);
      }
      this.clearSelections();
    },

    render: function () {
      var totalPrice = _.reduce(this.props.purchaseOrderRows, (total, row) => {
        var title = this.props.titles[row.titleId] || { };
        var titlePrice = row.priceOverride || title.priceWithTax || 0;
        return total + row.amount * titlePrice;
      }, 0);

      var canEdit = !this.props.readOnly;
      var canDelete = !!(!this.props.readOnly && this.props.purchaseOrderRows && this.props.purchaseOrderRows.length === 0);

      return (
        <Panel className="purchase-order">
          <h2>
            { this.props.costCenter.code } { this.props.purchaseOrder.name }
            <ButtonLink bsStyle="link" className="edit" to="edit_purchase_order"
              disabled={ !canEdit } params={ { purchaseOrder: this.props.purchaseOrder.orderId } }>
              <Glyphicon glyph="pencil" />
            </ButtonLink>
            <ButtonLink bsStyle="link" className="delete" to="delete_purchase_order"
              disabled={ !canDelete } params={ { purchaseOrder: this.props.purchaseOrder.orderId } }>
              <Glyphicon glyph="remove" />
            </ButtonLink>
          </h2>
          <div className="toolBar pull-left">
            <ButtonLink to="new_purchase_order_row" disabled={ this.props.readOnly }
              params={ { purchaseOrder: this.props.purchaseOrder.orderId } } bsStyle="primary">
              <Glyphicon glyph="plus" />
              <span> Lisää tuote</span>
            </ButtonLink>
          </div>
          <ApproversOnly className="toolBar pull-right">
            <Button bsStyle="success" onClick={ this.acceptRows } disabled={ !this.areRowsSelected() }>
              <Glyphicon glyph="ok" />
              <span> Hyväksy</span>
            </Button>
            <Button bsStyle="danger" className="space-left" onClick={ this.declineRows } disabled={ !this.areRowsSelected() }>
              <Glyphicon glyph="remove" />
              <span> Hylkää</span>
            </Button>
          </ApproversOnly>
          <PurchaseOrderRowTable
            purchaseOrderRows={ this.props.purchaseOrderRows }
            titles={ this.props.titles }
            deliveries={ this.props.deliveries }
            readOnly={ this.props.readOnly }
            selectionCallback={ this.rowSelectionChanged }
            restrictToRoles={ restrictToRoles }
          />
          <div className="purchase-order-total-price">
            Yhteensä: <Price value={ totalPrice } />
          </div>
        </Panel>
      );
    },
  });

  return PurchaseOrder;
}

module.exports = getPurchaseOrder;
