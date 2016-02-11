var React = require('react');
var ReactAddons = require('react/addons').addons;
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var _ = require('lodash');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Well = ReactBootstrap.Well;
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;
var PurchaseOrderList = require('./PurchaseOrderList');
var CostCenterSelector = require('./utils/CostCenterSelector');

var Price = require('./utils/Price');

var connectToStores = require('alt/utils/connectToStores');

var RouteHandler = require('react-router').RouteHandler;

var Reactable = require('reactable');
var Table = Reactable.Table;
var Tr = Reactable.Tr;
var Td = Reactable.Td;

var getCostcenterPurchaseOrders = function(PurchaseOrderActions, CostCenterActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore) {
  var costCenterPurchaseOrders = React.createClass({
    mixins: [ ReactAddons.LinkedStateMixin ],

    propTypes: {
      purchaseOrders: React.PropTypes.object,
      costCenters: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
    },

    getInitialState: function() {
      return { costcenterId: 0 };
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
      var allPurchaseOrders = this.props.purchaseOrders.allPurchaseOrders || { };
      var shownPurchaseOrders = _.filter(allPurchaseOrders, { costcenterId: +this.state.costcenterId });

      var costCenterLink = this.linkState('costcenterId');

      var list = (
        <PurchaseOrderList
          purchaseOrders={ shownPurchaseOrders }
          purchaseOrderRows={ orderRows }
          titles={ titles }
          costCenters={ this.props.costCenters.allCostCenters }
          deliveries={ this.props.deliveries.deliveries }
          readOnly={ true }
        />
      );

      if (!this.state.costcenterId) {
        list = <div>Valitse kustannuspaikka.</div>;
      }

      return (
        <Row>
          <Col>
            <h1>Tilaukset kustannuspaikoittain</h1>

            <Well className="filter-well">
              <form className="form-horizontal">
                <CostCenterSelector
                  costCenters={ this.props.costCenters.allCostCenters }
                  label="Kustannuspaikka"
                  valueLink={ costCenterLink }
                  labelClassName="col-xs-2 text-left"
                  wrapperClassName="col-xs-3"
                />
              </form>
            </Well>
            { list }
          </Col>
        </Row>
      );
    },
  });

  return connectToStores(costCenterPurchaseOrders);
};

module.exports = getCostcenterPurchaseOrders;
