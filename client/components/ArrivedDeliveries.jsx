var React = require('react');
var ReactAddons = require('react/addons').addons;
var ReactBootstrap = require('react-bootstrap');
var connectToStores = require('alt/utils/connectToStores');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Well = ReactBootstrap.Well;
var ExternalOrderSelector = require('./utils/ExternalOrderSelector');

function getArrivedDeliveries(ExternalOrderStore, ExternalOrderActions) {
  return connectToStores(React.createClass({
    mixins: [ ReactAddons.LinkedStateMixin ],

    propTypes: {
      externalOrders: React.PropTypes.object,
    },

    getInitialState: function() {
      return { externalorderId: 0 };
    },

    statics: {
      getStores() {
        return [ ExternalOrderStore ];
      },

      getPropsFromStores() {
        return {
          externalOrders: ExternalOrderStore.getState(),
        };
      },
    },

    componentWillMount() {
      ExternalOrderActions.fetchExternalOrders();
    },

    render() {
      var externalOrderLink = this.linkState('externalorderId');

      return (
        <Row>
          <Col>
            <h1>
              Saapuvat tilaukset
            </h1>
            <Well className="filter-well">
              <form className="form-horizontal">
                <ExternalOrderSelector
                  externalOrders={ this.props.externalOrders.externalOrders }
                  label="Ulkoinen tilaus"
                  valueLink={ externalOrderLink }
                  labelClassName="col-xs-2 text-left"
                  wrapperClassName="col-xs-3"
                />
              </form>
            </Well>
          </Col>
        </Row>
      );
    },
  }));
}

module.exports = getArrivedDeliveries;
