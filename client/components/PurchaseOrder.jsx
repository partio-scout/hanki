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

function getPurchaseOrder() {
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
        'selectedRows': {
          'controller': [],
          'procurement': [],
        },
      };
    },

    rowSelectionChanged: function(orderRowId, type, isChecked) {
      var stateChange = { selectedRows: {} };
      if (isChecked) {
        stateChange.selectedRows[type] = this.state.selectedRows[type].concat([ orderRowId ]);
      }
      this.setState(stateChange);
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
          <div className="toolBar pull-right">
            <Button bsStyle="success">
              <Glyphicon glyph="check" />
              <span> Hyväksy (talous)</span>
            </Button>
            <Button bsStyle="danger" className="space-left">
              <Glyphicon glyph="check" />
              <span> Hylkää (talous)</span>
            </Button>
          </div>
          <PurchaseOrderRowTable
            purchaseOrderRows={ this.props.purchaseOrderRows }
            titles={ this.props.titles }
            deliveries={ this.props.deliveries }
            readOnly={ this.props.readOnly }
            selectionCallback={ this.rowSelectionChanged }
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
