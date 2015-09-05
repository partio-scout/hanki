var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var RouteHandler = require('react-router').RouteHandler;

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonLink = ReactRouterBootstrap.ButtonLink;

var PurchaseOrderList = require('./PurchaseOrderList.jsx');
var PurchaseOrderLink = require('./PurchaseOrderLink.jsx');

var getMyPurchaseOrders = function(PurchaseOrderStore, PurchaseOrderActions) {
  return React.createClass({
    getInitialState() {
      return PurchaseOrderStore.getState();
    },

    componentDidMount() {
      PurchaseOrderStore.listen(this.onChange);
    },

    componentDidUnmount() {
      PurchaseOrderStore.unlisten(this.onChange);
    },

    onChange(state) {
      this.setState(state);
    },

    render: function () {
      return (
        <Row>
          <Col>
            <RouteHandler />
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
            <PurchaseOrderList purchaseOrders={ this.state.myPurchaseOrders } purchaseOrderRows={ this.state.purchaseOrderRows } />
          </Col>
        </Row>
      );
    }
  });
};

module.exports = getMyPurchaseOrders;
