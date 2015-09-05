var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var connectToStores = require('alt/utils/connectToStores');

var RouteHandler = require('react-router').RouteHandler;

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonLink = ReactRouterBootstrap.ButtonLink;

var PurchaseOrderList = require('./PurchaseOrderList.jsx');
var PurchaseOrderLink = require('./PurchaseOrderLink.jsx');

var getMyPurchaseOrders = function(PurchaseOrderStore, CostCenterStore, PurchaseOrderActions) {
  var myPurchaseOrders = React.createClass({
    statics: {
      getStores() {
        return [ PurchaseOrderStore, CostCenterStore ]
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          costCenters: CostCenterStore.getState()
        }
      }
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
            <PurchaseOrderList
              purchaseOrders={ this.props.purchaseOrders.myPurchaseOrders }
              purchaseOrderRows={ this.props.purchaseOrders.purchaseOrderRows }
              costCenters={ this.props.costCenters.costCenters } />
          </Col>
        </Row>
      );
    }
  });

  return connectToStores(myPurchaseOrders);
};

module.exports = getMyPurchaseOrders;
