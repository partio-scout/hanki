var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var RouteHandler = require('react-router').RouteHandler;
var connectToStores = require('alt/utils/connectToStores');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var ButtonLink = ReactRouterBootstrap.ButtonLink;

function getExternalOrders(ExternalOrderStore, PurchaseOrderStore, ExternalOrderList, TitleStore, CostCenterStore, DeliveryStore) {
  return connectToStores(React.createClass({
    propTypes: {
      externalOrders: React.PropTypes.object,
      orderRows: React.PropTypes.object,
      titles: React.PropTypes.object,
      costcenters: React.PropTypes.object,
      purchaseOrders: React.PropTypes.object,
      deliveries: React.PropTypes.object,
    },

    statics: {
      getStores() {
        return [ ExternalOrderStore, PurchaseOrderStore, TitleStore, CostCenterStore ];
      },

      getPropsFromStores() {
        return {
          externalOrders: ExternalOrderStore.getState().externalOrders,
          orderRows: PurchaseOrderStore.getState().purchaseOrderRows,
          titles: TitleStore.getState().titles,
          costcenters: CostCenterStore.getState().allCostCenters,
          purchaseOrders: PurchaseOrderStore.getState().allPurchaseOrders,
          deliveries: DeliveryStore.getState().deliveries,
        };
      },
    },

    render() {
      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Ulkoiset tilaukset
            </h1>
            <div className="toolBar">
              <ButtonLink to="new_external_order" bsStyle="primary">
                <Glyphicon glyph="plus" />
                <span> Uusi ulkoinen tilaus</span>
              </ButtonLink>
            </div>
            <ExternalOrderList
              externalOrders={ this.props.externalOrders }
              orderRows={ this.props.orderRows }
              readOnly={ false }
              titles={ this.props.titles }
              costcenters={ this.props.costcenters }
              purchaseOrders={ this.props.purchaseOrders }
              deliveries={ this.props.deliveries }
            />
          </Col>
        </Row>
      );
    },
  }));
}

module.exports = getExternalOrders;
