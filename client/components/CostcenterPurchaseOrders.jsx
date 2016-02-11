var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var _ = require('lodash');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;

var Price = require('./utils/Price');

var connectToStores = require('alt/utils/connectToStores');

var RouteHandler = require('react-router').RouteHandler;

var Reactable = require('reactable');
var Table = Reactable.Table;
var Tr = Reactable.Tr;
var Td = Reactable.Td;

var getCostcenterPurchaseOrders = function(PurchaseOrderActions, CostCenterActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore) {
  var costCenterPurchaseOrders = React.createClass({
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
      CostCenterActions.fetchAllCostCenters();
    },

    render: function () {
      var titles = this.props.titles.titles || { };
      var orderRows = _.values(this.props.purchaseOrders.purchaseOrderRows || { });
      var purchaseOrders = this.props.purchaseOrders.allPurchaseOrders || { };

      return (
        <span>TODO</span>
      );
    },
  });

  return connectToStores(costCenterPurchaseOrders);
};

module.exports = getCostcenterPurchaseOrders;
