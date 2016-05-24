var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var _ = require('lodash');

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

    componentDidMount: function() {
      PurchaseOrderActions.fetchAllPurchaseOrders();
    },

    componentDidUpdate: function() {
      PurchaseOrderActions.fetchAllPurchaseOrders();
    },

    render: function () {
      var allOrders = this.props.purchaseOrders.allPurchaseOrders || {};
      var ownedCostcenterIds = _.map(this.props.costCenters.ownCostCenters, function(c) { return c.costcenterId; });
      var ordersOfOwnedCostcenters = _.filter(allOrders, function(o) {
        return _.some(ownedCostcenterIds, function(id) {
          if (id == o.costcenterId) {
            return true;
          } else {
            return false;
          }
        });
      });

      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Omat tilaukset
            </h1>
            <div className="toolBar">
              <ButtonLink to="new_purchase_order" bsStyle="primary" disabled>
                <Glyphicon glyph="plus" />
                <span> Uusi tilaus</span>
              </ButtonLink>
            </div>
            <PurchaseOrderList
              purchaseOrders={ ordersOfOwnedCostcenters }
              purchaseOrderRows={ this.props.purchaseOrders.purchaseOrderRows }
              costCenters={ this.props.costCenters.ownCostCenters }
              titles={ this.props.titles.titles }
              deliveries={ this.props.deliveries.deliveries }
              readOnly={ true }
            />
          </Col>
        </Row>
      );
    },
  });

  return connectToStores(myPurchaseOrders);
};

module.exports = getMyPurchaseOrders;
