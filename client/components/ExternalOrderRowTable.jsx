var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Table = ReactBootstrap.Table;
var Price = require('./utils/Price');

function getExternalOrderRowTable(PurchaseOrderActions, ExternalOrderActions, restrictToRoles) {
  var DeleteRowButton = React.createClass({
    propTypes: {
      rowId: React.PropTypes.object,
      removeRow: React.PropTypes.func,
      disabled: React.PropTypes.object,
    },

    removeRowFromExternalOrder() {
      this.props.removeRow(this.props.rowId);
    },

    render() {
      return ( <Button disabled = { this.props.disabled } onClick={ this.removeRowFromExternalOrder } className="row-inline remove-row"><span> <Glyphicon glyph="remove" /> </span> </Button> );
    },
  });

  var ExternalOrderRow = React.createClass({
    propTypes: {
      row: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      purchaseOrder: React.PropTypes.object,
      costcenter: React.PropTypes.object,
      title: React.PropTypes.object,
      delivery: React.PropTypes.object,
    },

    getDefaultProps: function() {
      return {
        readOnly: false,
      };
    },

    removeRowFromExternalOrder(rowId) {
      var row = this.props.row;
      row.externalorderId = 0;
      ExternalOrderActions.updatePurchaseOrderRow(row);
    },

    render: function () {
      var row = this.props.row;
      var title = this.props.title;

      return (
        <tr>
          <td className="external_order_row_name">
            <div>
              <DeleteRowButton removeRow={ this.removeRowFromExternalOrder } rowId={ row.orderRowId } disabled={ row.ordered } />
              <ButtonLink bsStyle="link" className="edit-row" to="external_orders_edit_row" disabled={ row.ordered }
                params={ { purchaseOrderRow: row.orderRowId } }>
                <Glyphicon glyph="pencil" />
              </ButtonLink>
              <span className="product-name">
                { (row.nameOverride && ('Muu: ' + row.nameOverride) || title.name) }
              </span>
            </div>
          </td>
          <td>
            { row.amount } { row.unitOverride || title.unit }
          </td>
          <td className="price">
            <Price value={ (row.priceOverride || title.priceWithTax) * row.amount } />
          </td>
          <td>
            { this.props.costcenter.code } { this.props.purchaseOrder.name }
          </td>
          <td>
            { this.props.delivery.name }
          </td>
        </tr>
      );
    },
  });

  var ExternalOrderRowTable = React.createClass({
    propTypes: {
      orderRows: React.PropTypes.object,
      titles: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      purchaseOrders: React.PropTypes.object,
      costcenters: React.PropTypes.object,
      deliveries: React.PropTypes.object,
    },

    getDefaultProps: function() {
      return {
        readOnly: false,
      };
    },

    render: function() {
      return (
        <Table striped>
          <thead>
            <tr>
              <th rowSpan="2">Tuote</th>
              <th rowSpan="1">Määrä</th>
              <th rowSpan="1">Summa</th>
              <th rowSpan="4">Kohde</th>
              <th rowSpan="4">Toimitustapa</th>
            </tr>
          </thead>
          <tbody>
            {
              _.map(this.props.orderRows, row => {
                var order = this.props.purchaseOrders[row.orderId] || {};
                var costcenter = _.find(this.props.costcenters, { 'costcenterId': order.costcenterId }) || {};
                var title = this.props.titles[row.titleId] || {};
                var delivery = this.props.deliveries[row.deliveryId] || {};

                return (
                  <ExternalOrderRow
                    key={ row.orderRowId }
                    row={ row }
                    readOnly={ this.props.readOnly }
                    purchaseOrder={ order }
                    title={ title }
                    costcenter={ costcenter }
                    delivery={ delivery }
                  />
                );
              })
            }
          </tbody>
        </Table>
      );
    },
  });

  return ExternalOrderRowTable;
}

module.exports = getExternalOrderRowTable;
