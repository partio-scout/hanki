var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonLink = ReactRouterBootstrap.ButtonLink;

var PurchaseOrder = require('./PurchaseOrder');
var PurchaseOrderLink = require('./PurchaseOrderLink');

var MyPurchaseOrders = React.createClass({
  render: function () {
    return (
      <Row>
        <Col>
          <h1>
            Omat tilaukset
          </h1>
          <ButtonLink to="new_purchase_order" bsStyle="primary">
            Uusi tilaus
          </ButtonLink>
          <div>
            <PurchaseOrderLink />
            <PurchaseOrderLink />
          </div>
          <PurchaseOrder />
          <PurchaseOrder />
        </Col>
      </Row>
    );
  }
});

module.exports = MyPurchaseOrders;
