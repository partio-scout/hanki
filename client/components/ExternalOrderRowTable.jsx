var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Table = ReactBootstrap.Table;
var Price = require('./utils/Price');

function getExternalOrderRowTable(restrictToRoles) {
  var ExternalOrderRow = React.createClass({
    propTypes: {
      row: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      purchaseOrder: React.PropTypes.object,
      costcenter: React.PropTypes.object,
      title: React.PropTypes.object,
    },

    getDefaultProps: function() {
      return {
        readOnly: false,
      };
    },

    render: function () {
      var row = this.props.row;
      var title = this.props.title;

      return (
        <tr>
          <td className="external_order_row_name">
             <div className="product-name">
              { (row.nameOverride && ('Muu: ' + row.nameOverride) || title.name) }
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
            </tr>
          </thead>
          <tbody>
            {
              _.map(this.props.orderRows, row => {
                var order = this.props.purchaseOrders[row.orderId] || {};
                var costcenter = _.find(this.props.costcenters, { 'costcenterId': order.costcenterId }) || {};
                var title = this.props.titles[row.titleId] || {};

                return (
                  <ExternalOrderRow
                    key={ row.orderRowId }
                    row={ row }
                    readOnly={ this.props.readOnly }
                    purchaseOrder={ order }
                    title={ title }
                    costcenter={ costcenter }
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
