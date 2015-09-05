var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;

var ReactRouterBootstrap = require('react-router-bootstrap');
var ButtonLink = ReactRouterBootstrap.ButtonLink;

var PurchaseOrderRow = React.createClass({
  render: function () {
    return (
      <div>
        Tilausrivi: { this.props.row.amount } yksikköä
      </div>
    );
  }
});

var PurchaseOrder = React.createClass({
  getDefaultProps: function() {
    return {
      costCenter: { name: '...' }
    }
  },

  render: function () {
    return (
      <Panel>
        <h2>
          { this.props.costCenter.code } { this.props.purchaseOrder.name }
        </h2>
        <ButtonLink to="new_purchase_order_row" params={{ purchaseOrder: this.props.purchaseOrder.orderId }} bsStyle="primary">Lisää tuote</ButtonLink>
        {_.map(this.props.purchaseOrderRows, function(row) {
          return <PurchaseOrderRow row={ row } />
        })}
      </Panel>
    );
  }
});

module.exports = PurchaseOrder;
