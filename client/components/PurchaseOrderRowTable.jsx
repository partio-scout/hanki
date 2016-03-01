var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Table = ReactBootstrap.Table;
var Price = require('./utils/Price');
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Glyphicon = ReactBootstrap.Glyphicon;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var PurchaseOrderRow = React.createClass({
  propTypes: {
    row: React.PropTypes.object,
    titles: React.PropTypes.object,
    deliveries: React.PropTypes.object,
    readOnly: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      titles: { },
      row: { },
      deliveries: { },
      readOnly: false,
    };
  },

  render: function () {
    var row = this.props.row;
    var title = this.props.titles[row.titleId] || { };
    var delivery = this.props.deliveries[row.deliveryId] || { };

    var memoTooltip = (
      <Tooltip>{ row.memo }</Tooltip>
    );
    var comment = '';
    if (row.memo) {
      comment = (
        <OverlayTrigger placement="top" overlay={ memoTooltip }>
          <Glyphicon glyph="comment" />
        </OverlayTrigger>
      );
    }

    return (
      <tr>
        <td className="purchase_order_row_name">
          <ButtonLink bsStyle="link" className="edit" to="edit_purchase_order_row"
            disabled={ this.props.readOnly } params={ { purchaseOrderRow: row.orderRowId } }>
            <Glyphicon glyph="pencil" />
          </ButtonLink>
          <ButtonLink bsStyle="link" className="delete" to="delete_purchase_order_row"
            disabled={ this.props.readOnly } params={ { purchaseOrderRow: row.orderRowId } }>
            <Glyphicon glyph="remove" />
          </ButtonLink>
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
        <td className="memo">
          { comment }
        </td>
        <td>
          { row.requestService ? <Glyphicon glyph="ok" bsClass="glyphicon text-success" /> : null }
        </td>
        <td>

        </td>
        <td>

        </td>
        <td>

        </td>
        <td>

        </td>
        <td>

        </td>
        <td className="delivery">
          { delivery.name }
        </td>
      </tr>
    );
  },
});

var PurchaseOrderRowTable = React.createClass({
  propTypes: {
    purchaseOrderRows: React.PropTypes.object,
    titles: React.PropTypes.object,
    deliveries: React.PropTypes.object,
    readOnly: React.PropTypes.bool,
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
            <th rowSpan="2">Määrä</th>
            <th rowSpan="2">Summa</th>
            <th rowSpan="2">Huomiot</th>
            <th rowSpan="2">Vaatii palvelua</th>
            <th rowSpan="2">Hyväksyt&shy;täväksi</th>
            <th colSpan="3" className="acceptance-colunms">Hyväksyntä</th>
            <th rowSpan="2">Tilattu</th>
            <th rowSpan="2">Toimitus</th>
          </tr>
          <tr>
            <th>päällikkö</th>
            <th>hankinta</th>
            <th>talous</th>
          </tr>
        </thead>
        <tbody>
          {
            _.map(this.props.purchaseOrderRows, row =>
              <PurchaseOrderRow
                row={ row }
                titles={ this.props.titles }
                deliveries={ this.props.deliveries }
                readOnly={ this.props.readOnly }
              />
            )
          }
        </tbody>
      </Table>
    );
  },
});

module.exports = PurchaseOrderRowTable;
