var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;

var connectToStores = require('alt/utils/connectToStores');

var RouteHandler = require('react-router').RouteHandler;

var getAllPurchaseOrders = function(accessToken, PurchaseOrderActions, CostCenterActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore, ExternalOrderActions, ExternalOrderStore, AllPurchaseOrdersTable) {
  var allPurchaseOrders = React.createClass({
    propTypes: {
      purchaseOrders: React.PropTypes.object,
      costCenters: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
      externalOrders: React.PropTypes.object,
    },

    statics: {
      getStores() {
        return [ PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore, ExternalOrderStore ];
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          costCenters: CostCenterStore.getState(),
          titles: TitleStore.getState(),
          deliveries: DeliveryStore.getState(),
          externalOrders: ExternalOrderStore.getState(),
        };
      },
    },

    componentDidMount: function() {
      PurchaseOrderActions.fetchAllPurchaseOrders();
      CostCenterActions.fetchAllCostCenters();
      ExternalOrderActions.fetchExternalOrders();
    },

    render: function () {
      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Kaikki tilaukset
            </h1>
            <Button href={ '/api/Purchaseorderrows/CSVExport?access_token=' + accessToken.id } bsStyle="primary">
              <Glyphicon glyph="download-alt" />
              <span> Lataa kaikki tilaukset</span>
            </Button>
            <AllPurchaseOrdersTable
              {...this.props}
              purchaseOrderRows={ this.props.purchaseOrders.purchaseOrderRows }
            />
          </Col>
        </Row>
      );
    },
  });

  return connectToStores(allPurchaseOrders);
};

module.exports = getAllPurchaseOrders;
