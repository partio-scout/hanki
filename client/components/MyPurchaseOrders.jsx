var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var connectToStores = require('alt/utils/connectToStores');

var RouteHandler = require('react-router').RouteHandler;

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var ButtonLink = ReactRouterBootstrap.ButtonLink;

var getMyPurchaseOrders = function(PurchaseOrderActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore, PurchaseOrderList) {
  var myPurchaseOrders = React.createClass({
    propTypes: {
      purchaseOrders: React.PropTypes.object,
      costCenters: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
    },

    statics: {
      getStores() {
        return [ PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore ];
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          costCenters: CostCenterStore.getState(),
          titles: TitleStore.getState(),
          deliveries: DeliveryStore.getState(),
        };
      },
    },

    render: function () {
      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Omat tilaukset
            </h1>
            <div className="toolBar">
              <ButtonLink to="new_purchase_order" bsStyle="primary" disabled={ true }>
                <Glyphicon glyph="plus" />
                <span> Uusi tilaus</span>
              </ButtonLink>
            </div>
            <PurchaseOrderList
              purchaseOrders={ this.props.purchaseOrders.myPurchaseOrders }
              purchaseOrderRows={ this.props.purchaseOrders.purchaseOrderRows }
              costCenters={ this.props.costCenters.ownCostCenters }
              titles={ this.props.titles.titles }
              deliveries={ this.props.deliveries.deliveries }
            />
          </Col>
        </Row>
      );
    },
  });

  return connectToStores(myPurchaseOrders);
};

module.exports = getMyPurchaseOrders;
