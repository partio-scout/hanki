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
var Input = ReactBootstrap.Input;

function getAcceptanceStatus(editRoles, restrictToRoles) {
  var Restricted = restrictToRoles(editRoles, 'div');

  var AcceptanceStatus = React.createClass({
    propTypes: {
      status: React.PropTypes.oneOfType([ React.PropTypes.bool, React.PropTypes.object ]),
      onChange: React.PropTypes.func,
      isSelectedCallback: React.PropTypes.func,
      orderRowId: React.PropTypes.func,
      type: React.PropTypes.string,
    },

    onChange: function() {
      this.props.onChange && this.props.onChange(this.props.orderRowId, this.props.type, !this.isChecked());
    },

    isChecked: function() {
      return this.props.isSelectedCallback(this.props.type, this.props.orderRowId);
    },

    render: function() {
      if (this.props.status === true) {
        return <Glyphicon glyph="ok" className="accepted" />;
      } else if (this.props.status === false) {
        return <Glyphicon glyph="remove" className="declined" />;
      } else {
        return (
          <Restricted>
            <Input
              type="checkbox"
              onChange={ this.onChange }
              checked={ this.isChecked() }
            />
          </Restricted>
        );
      }
    },
  });

  return AcceptanceStatus;
}

function getPurchaseOrderRowTable(restrictToRoles) {
  var ControllerAcceptance = getAcceptanceStatus([ 'controller' ], restrictToRoles);
  var ProcurementAcceptance = getAcceptanceStatus([ 'procurementMaster', 'procurementAdmin' ], restrictToRoles);

  var PurchaseOrderRow = React.createClass({
    propTypes: {
      row: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      selectionCallback: React.PropTypes.function,
      isSelectedCallback: React.PropTypes.function,
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
            { row.requestService ? <Glyphicon glyph="ok" bsClass="glyphicon accepted" /> : null }
          </td>
          <td>

          </td>
          <td>

          </td>
          <td>
            <ProcurementAcceptance
              type="procurement"
              status={ row.providerApproval }
              onChange={ this.props.selectionCallback }
              isSelectedCallback={ this.props.isSelectedCallback }
              orderRowId={ row.orderRowId }
            />
          </td>
          <td>
            <ControllerAcceptance
              type="controller"
              status={ row.controllerApproval }
              onChange={ this.props.selectionCallback }
              isSelectedCallback={ this.props.isSelectedCallback }
              orderRowId={ row.orderRowId }
            />
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
      selectionCallback: React.PropTypes.function,
      isSelectedCallback: React.PropTypes.function,
    },

    getDefaultProps: function() {
      return {
        readOnly: false,
        selectionCallback: _.noop,
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
                  selectionCallback={ this.props.selectionCallback }
                  isSelectedCallback={ this.props.isSelectedCallback }
                />
              )
            }
          </tbody>
        </Table>
      );
    },
  });

  return PurchaseOrderRowTable;
}

module.exports = getPurchaseOrderRowTable;
