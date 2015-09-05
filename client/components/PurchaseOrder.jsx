var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;

var ReactRouterBootstrap = require('react-router-bootstrap');
var ButtonLink = ReactRouterBootstrap.ButtonLink;

var PurchaseOrderRow = React.createClass({
  render: function () {
    return (
      <div>
        Tilausrivi.
      </div>
    );
  }
});

var PurchaseOrder = React.createClass({
  render: function () {
    return (
      <Panel>
        <h2>
          00000 { this.props.purchaseOrder.name }
        </h2>
        <ButtonLink to="new_purchase_order_row" bsStyle="primary">Lisää tuote</ButtonLink>
        <PurchaseOrderRow />
        <PurchaseOrderRow />
      </Panel>
    );
  }
});

module.exports = PurchaseOrder;
