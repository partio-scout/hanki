var _ = require('lodash');
var React = require('react');
var ReactAddons = require('react/addons').addons;
var ReactBootstrap = require('react-bootstrap');
var connectToStores = require('alt/utils/connectToStores');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Well = ReactBootstrap.Well;
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;
var Input = ReactBootstrap.Input;
var ExternalOrderSelector = require('./utils/ExternalOrderSelector');

function getArrivedDeliveries(accessToken, ExternalOrderStore, ExternalOrderActions, PurchaseOrderStore, PurchaseOrderActions, CostCenterStore, CostCenterActions, TitleStore, TitleActions, ArrivedDelivery) {
  return connectToStores(React.createClass({
    mixins: [ ReactAddons.LinkedStateMixin ],

    propTypes: {
      externalOrders: React.PropTypes.object,
      costCenters: React.PropTypes.object,
      titles: React.PropTypes.object,
    },

    getInitialState: function() {
      return {
        externalorderId: 0,
        externalorderIdForExport: 0,
        arrivalDate: null,
      };
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
      var externalOrderLinkForExport = this.linkState('externalorderIdForExport');
      var dateLinkForExport = this.linkState('arrivalDate');
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
        component = <div></div>;
      }

      return (
        <Row>
          <Col>
            <h1>
              Saapuvat tilaukset
            </h1>
            <Well className="filter-well">
              <p>Saapuneiden tilausten vienti</p>
              <form className="form-inline">
                <ExternalOrderSelector
                  externalOrders={ this.props.externalOrders }
                  label="Ulkoinen tilaus"
                  valueLink={ externalOrderLinkForExport }
                  labelClassName="col-xs-5 text-center"
                  wrapperClassName="col-xs-1"
                  className="arrived-delivery-export"
                />
                <Input type="date" label="Saapumispäivä" valueLink={ dateLinkForExport } labelClassName="col-xs-4 text-center" wrapperClassName="col-xs-2"/>
                <Button href={ '/api/ArrivedDeliveryRows/CSVExport/' + this.state.externalorderIdForExport + '/' + (this.state.arrivalDate || 'null') + '?access_token=' + accessToken.id } bsStyle="primary" >
                  <Glyphicon glyph="download-alt" />
                  <span> Lataa saapuneet tilaukset </span>
                </Button>
              </form>
            </Well>
            <Well className="filter-well">
              <p>Uusi saapuva tilaus</p>
              <form className="form-horizontal">
                <ExternalOrderSelector
                  externalOrders={ this.props.externalOrders }
                  label="Ulkoinen tilaus "
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
