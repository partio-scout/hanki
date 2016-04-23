var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;

var ReactRouterBootstrap = require('react-router-bootstrap');
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var ExternalOrderRowTable = require('./ExternalOrderRowTable');

var Price = require('./utils/Price');

function getExternalOrder(ExternalOrderActions, ExternalOrderRowTable, restrictToRoles) {

  var ExternalOrder = React.createClass({
    propTypes: {
      orderRows: React.PropTypes.object,
      externalOrder: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
    },

    getDefaultProps: function() {
      return {
        readOnly: false,
      };
    },

    render: function () {

      return (
        <Panel className="external-order">
          <h2>
            { this.props.externalOrder.externalorderCode } { this.props.externalOrder.supplierName }
          </h2>
          <ExternalOrderRowTable
            orderRows={ this.props.orderRows }
            readOnly={ this.props.readOnly }
          />
        </Panel>
      );
    },
  });

  return ExternalOrder;
}

module.exports = getExternalOrder;
