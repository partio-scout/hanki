var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Table = ReactBootstrap.Table;
var Price = require('./utils/Price');
var Button = ReactBootstrap.Button;
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Glyphicon = ReactBootstrap.Glyphicon;
var Tooltip = ReactBootstrap.Tooltip;
var Input = ReactBootstrap.Input;

function getExternalOrderRowTable(restrictToRoles) {
  var ExternalOrderRow = React.createClass({
    propTypes: {
      row: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
    },

    getDefaultProps: function() {
      return {
        titles: { },
        row: { },
        deliveries: { },
        readOnly: false,
        selectionCallback: _.noop,
      };
    },

    render: function () {
      var row = this.props.row;

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
        </tr>
      );
    },
  });

  var ExternalOrderRowTable = React.createClass({
    propTypes: {
      purchaseOrderRows: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      selectionCallback: React.PropTypes.function,
      isSelectedCallback: React.PropTypes.function,
      selectAllCallback: React.PropTypes.function,
    },

    getDefaultProps: function() {
      return {
        readOnly: false,
        selectionCallback: _.noop,
      };
    },

    selectAllProcurement: function() {
      this.props.selectAllCallback('procurement');
    },

    selectAllController: function() {
      this.props.selectAllCallback('controller');
    },

    render: function() {
      return (
        <Table striped>
          <thead>
            <tr>
              <th rowSpan="2">Tuote</th>
              <th rowSpan="2">Määrä</th>
              <th rowSpan="2">Summa</th>
            </tr>
          </thead>
          <tbody>
            {
              _.map(this.props.externalOrderRows, row =>
                <ExternalOrderRow
                  row={ row }
                  readOnly={ this.props.readOnly }
                />
              )
            }
          </tbody>
        </Table>
      );
    },
  });

  return ExternalOrderRowTable;
}

module.exports = getExternalOrderRowTable;
