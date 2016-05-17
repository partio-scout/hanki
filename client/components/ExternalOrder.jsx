var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button;

var ReactRouterBootstrap = require('react-router-bootstrap');
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var ExternalOrderRowTable = require('./ExternalOrderRowTable');

function getExternalOrder(ExternalOrderActions, PurchaseOrderActions, ExternalOrderRowTable, restrictToRoles) {

  var ExternalOrder = React.createClass({
    propTypes: {
      orderRows: React.PropTypes.object,
      externalOrder: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      purchaseOrders: React.PropTypes.object,
      costcenters: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
    },

    getDefaultProps: function() {
      return {
        readOnly: false,
      };
    },

    markOrdered: function() {
      var order = this.props.externalOrder;
      order.ordered = true;
      ExternalOrderActions.updateExternalOrder(order);
      _.forEach(this.props.orderRows, function(row) {
        row.ordered = true;
        PurchaseOrderActions.updatePurchaseOrderRow(row);
      });
    },

    markNotOrdered: function() {
      var order = this.props.externalOrder;
      order.ordered = false;
      ExternalOrderActions.updateExternalOrder(order);
      _.forEach(this.props.orderRows, function(row) {
        row.ordered = false;
        PurchaseOrderActions.updatePurchaseOrderRow(row);
      });
    },

    render: function () {
      var canDelete = (this.props.externalOrder && this.props.externalOrder.order_rows.length === 0 && !this.props.externalOrder.ordered);

      var orderedButton = <div></div>;
      var orderedStatus = <span></span>;
      if (this.props.externalOrder.ordered) {
        orderedButton = <Button bsStyle="primary" onClick={ this.markNotOrdered } className="edit" ><span> Merkitse tilaamattomaksi </span> </Button>;
        orderedStatus = <span className="ordered-status"> TILATTU </span>;
      } else {
        orderedButton = <Button bsStyle="primary" onClick={ this.markOrdered } className="edit" ><span> Merkitse tilatuksi </span> </Button>;
      }

      return (
        <Panel className="external-order">
          <h2>
              { this.props.externalOrder.externalorderCode } { this.props.externalOrder.supplierName }
            <ButtonLink bsStyle="link" className="edit" to="edit_external_order" params={ { externalorderId: this.props.externalOrder.externalorderId } }>
              <Glyphicon glyph="pencil" />
            </ButtonLink>
            <ButtonLink bsStyle="link" className="delete" to="delete_external_order" disabled={ !canDelete } params={ { externalorderId: this.props.externalOrder.externalorderId } }>
                <Glyphicon glyph="remove" />
            </ButtonLink>
            <ButtonLink bsStyle="primary" className="add_rows" to="add_rows_to_external_order" disabled={ this.props.externalOrder.ordered } params={ { externalorderId: this.props.externalOrder.externalorderId } }> <Glyphicon glyph="plus" />
              <span> Lisää tilausrivejä </span>
            </ButtonLink>
            <span> </span>
            { orderedButton }
            { orderedStatus }
          </h2>
          <ExternalOrderRowTable
            orderRows={ this.props.orderRows }
            readOnly={ this.props.readOnly }
            purchaseOrders={ this.props.purchaseOrders }
            costcenters={ this.props.costcenters }
            titles={ this.props.titles }
            deliveries={ this.props.deliveries }
          />
        </Panel>
      );
    },
  });

  return ExternalOrder;
}

module.exports = getExternalOrder;
