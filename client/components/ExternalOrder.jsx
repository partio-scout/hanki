var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Glyphicon = ReactBootstrap.Glyphicon;

var ReactRouterBootstrap = require('react-router-bootstrap');
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var ExternalOrderRowTable = require('./ExternalOrderRowTable');

function getExternalOrder(ExternalOrderActions, ExternalOrderRowTable, restrictToRoles) {

  var ExternalOrder = React.createClass({
    propTypes: {
      orderRows: React.PropTypes.object,
      externalOrder: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      purchaseOrders: React.PropTypes.object,
      costcenters: React.PropTypes.object,
      titles: React.PropTypes.object,
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
          <ButtonLink bsStyle="link" className="edit" to="edit_external_order" disabled= { this.props.externalOrder.ordered } params={ { externalorderId: this.props.externalOrder.externalorderId } }>
            <Glyphicon glyph="pencil" />
          </ButtonLink>
          </h2>
          <ExternalOrderRowTable
            orderRows={ this.props.orderRows }
            readOnly={ this.props.readOnly }
            purchaseOrders={ this.props.purchaseOrders }
            costcenters={ this.props.costcenters }
            titles={ this.props.titles }
          />
        </Panel>
      );
    },
  });

  return ExternalOrder;
}

module.exports = getExternalOrder;
