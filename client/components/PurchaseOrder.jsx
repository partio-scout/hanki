var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;

var ReactRouterBootstrap = require('react-router-bootstrap');
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var PurchaseOrderRowTable = require('./PurchaseOrderRowTable.jsx');

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
        <PurchaseOrderRowTable
          purchaseOrderRows={ this.props.purchaseOrderRows }
          titles={ this.props.titles } />
      </Panel>
    );
  }
});

module.exports = PurchaseOrder;
