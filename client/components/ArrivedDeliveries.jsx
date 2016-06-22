var _ = require('lodash');
var React = require('react');
var ReactAddons = require('react/addons').addons;
var ReactBootstrap = require('react-bootstrap');
var connectToStores = require('alt/utils/connectToStores');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Well = ReactBootstrap.Well;
var ExternalOrderSelector = require('./utils/ExternalOrderSelector');

function getArrivedDeliveries(ExternalOrderStore, ExternalOrderActions, PurchaseOrderStore, PurchaseOrderActions, CostCenterStore, CostCenterActions, TitleStore, TitleActions, ArrivedDelivery) {
  return connectToStores(React.createClass({
    mixins: [ ReactAddons.LinkedStateMixin ],

    propTypes: {
      externalOrders: React.PropTypes.object,

      costCenters: React.PropTypes.object,
      titles: React.PropTypes.object,
    },

    getInitialState: function() {
      return { externalorderId: 0 };
    },

    statics: {
      getStores() {
        return [ ExternalOrderStore, PurchaseOrderStore, CostCenterStore, TitleStore ];
      },

      getPropsFromStores() {
        return {
          externalOrders: ExternalOrderStore.getState().externalOrders,
          costCenters: CostCenterStore.getState().allCostCenters,
          titles: TitleStore.getState().titles,
        };
      },
    },

    componentWillMount() {
      ExternalOrderActions.fetchExternalOrders();
      PurchaseOrderActions.fetchAllPurchaseOrders();
      CostCenterActions.fetchAllCostCenters();
    },

    componentDidMount() {
      PurchaseOrderStore.listen(this.onPurchaseOrderStoreChange);
    },

    componentWillUnmount() {
      PurchaseOrderStore.unlisten(this.onPurchaseOrderStoreChange);
    },

    onPurchaseOrderStoreChange(state) {
      this.setState({
        purchaseOrderRows: state.purchaseOrderRows,
        purchaseOrders: state.allPurchaseOrders,
      });
    },

    resetPage() {
      this.setState({ externalorderId: 0 });
    },

    render() {
      var externalOrderLink = this.linkState('externalorderId');
      var rows = _.filter(this.state.purchaseOrderRows, { externalorderId: +this.state.externalorderId });

      var component = (
        <ArrivedDelivery
          externalOrder={ this.props.externalOrders[this.state.externalorderId] }
          purchaseOrderRows={ rows }
          purchaseOrders={ this.state.purchaseOrders }
          costCenters={ this.props.costCenters }
          titles={ this.props.titles }
          readOnly={ false }
          onDone={ this.resetPage }
        />
      );

      if (!this.state.externalorderId) {
        component = <div>Valitse ulkoinen tilaus.</div>;
      }

      return (
        <Row>
          <Col>
            <h1>
              Saapuvat tilaukset
            </h1>
            <Well className="filter-well">
              <form className="form-horizontal">
                <ExternalOrderSelector
                  externalOrders={ this.props.externalOrders }
                  label="Ulkoinen tilaus"
                  valueLink={ externalOrderLink }
                  labelClassName="col-xs-2 text-left"
                  wrapperClassName="col-xs-3"
                />
              </form>
            </Well>
            { component }
          </Col>
        </Row>
      );
    },
  }));
}

module.exports = getArrivedDeliveries;
