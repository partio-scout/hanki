var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Table = ReactBootstrap.Table;
var Price = require('./utils/Price');
var ArrivalStatus = require('./utils/ArrivalStatus');
var Button = ReactBootstrap.Button;
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Glyphicon = ReactBootstrap.Glyphicon;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

function getPurchaseOrderRowTable(getAcceptanceStatus, restrictToRoles, PurchaseOrderActions) {
  var ControllerAcceptance = getAcceptanceStatus([ 'controller' ], restrictToRoles);
  var ProcurementAcceptance = getAcceptanceStatus([ 'procurementMaster', 'procurementAdmin' ], restrictToRoles);

  var PurchaseOrderRow = React.createClass({
    propTypes: {
      row: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
      externalOrder: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      selectionCallback: React.PropTypes.func,
      resetCallback: React.PropTypes.func,
      isSelectedCallback: React.PropTypes.func,
      disableAddPurchaseNumber: React.PropTypes.bool,
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

    markOtherProductDelivered(id) {
      PurchaseOrderActions.setOtherProductDelivered(id);
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
      var orderedSymbol = null;
      var infoText = '';
      if (row.deliveryId === 1) {
        var symbol = row.ordered ? 'pencil' : 'plus';
        if (row.purchaseOrderNumber == '100') {
          infoText = 'Kululasku';
        } else if (row.purchaseOrderNumber !== '0') {
          infoText = row.purchaseOrderNumber;
        }
        orderedSymbol = ( <span> <ButtonLink bsStyle="link" className="add" to="add_purchase_order_number" disabled={ this.props.disableAddPurchaseNumber } params={ { rowId: row.orderRowId } }> <Glyphicon glyph={ symbol } /> </ButtonLink> { infoText } </span>);
      } else {
        if (this.props.externalOrder) {
          infoText = this.props.externalOrder.externalorderCode;
        }
        orderedSymbol = row.ordered ? <span> <Glyphicon glyph="ok" bsClass="glyphicon accepted" />  { infoText } </span> : null;
      }

      var price = 0;
      if (row.finalPrice === 0 || row.finalPrice) {
        price = row.finalPrice;
      } else {
        price =  (row.priceOverride || title.priceWithTax) * row.amount;
      }

      return (
        <tr>
          <td className="purchase_order_row_name">
            <ButtonLink bsStyle="link" className="edit" to="edit_purchase_order_row"
              disabled={ this.props.readOnly || row.prohibitChanges || row.ordered } params={ { purchaseOrderRow: row.orderRowId } }>
              <Glyphicon glyph="pencil" />
            </ButtonLink>
            <ButtonLink bsStyle="link" className="delete" to="delete_purchase_order_row"
              disabled={ this.props.readOnly || row.prohibitChanges || row.ordered } params={ { purchaseOrderRow: row.orderRowId } }>
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
            <Price value={ price }  />
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
          <td className="acceptance">
            <ProcurementAcceptance
              type="procurement"
              status={ row.providerApproval }
              onChange={ this.props.selectionCallback }
              isSelectedCallback={ this.props.isSelectedCallback }
              orderRowId={ row.orderRowId }
              onReset={ this.props.resetCallback }
            />
          </td>
          <td className="acceptance">
            <ControllerAcceptance
              type="controller"
              status={ row.controllerApproval }
              onChange={ this.props.selectionCallback }
              isSelectedCallback={ this.props.isSelectedCallback }
              orderRowId={ row.orderRowId }
              onReset={ this.props.resetCallback }
            />
          </td>
          <td className="ordered">
            { orderedSymbol }
          </td>
          <td className="delivery">
            { delivery.name }
          </td>
          <td className="arrived">
            <ArrivalStatus onMarkDelivered={ this.markOtherProductDelivered } row={ row } />
          </td>
        </tr>
      );
    },
  });

  var ProcurementButton = restrictToRoles([ 'procurementMaster', 'procurementAdmin' ], Button);
  var ControllerButton = restrictToRoles([ 'controller' ], Button);

  var PurchaseOrderRowTable = React.createClass({
    propTypes: {
      purchaseOrderRows: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
      externalOrders: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      selectionCallback: React.PropTypes.func,
      isSelectedCallback: React.PropTypes.func,
      selectAllCallback: React.PropTypes.func,
      resetCallback: React.PropTypes.func,
      disableAddPurchaseNumber: React.PropTypes.bool,
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
              <th rowSpan="2">Huomiot</th>
              <th rowSpan="2">Vaatii palvelua</th>
              <th rowSpan="2">Hyväksyt&shy;täväksi</th>
              <th colSpan="3" className="acceptance-colunms">Hyväksyntä</th>
              <th rowSpan="2">Tilattu</th>
              <th rowSpan="2">Toimitus</th>
              <th rowSpan="2">Saapunut</th>
            </tr>
            <tr>
              <th>
                päällikkö
              </th>
              <th>
                <div>hankinta</div>
                <ProcurementButton bsSize="xsmall" bsStyle="link" onClick={ this.selectAllProcurement }>
                  kaikki
                </ProcurementButton>
              </th>
              <th>
                <div>talous</div>
                <ControllerButton bsSize="xsmall" bsStyle="link" onClick={ this.selectAllController }>
                  kaikki
                </ControllerButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {
              _.map(this.props.purchaseOrderRows, row =>
                <PurchaseOrderRow
                  row={ row }
                  titles={ this.props.titles }
                  deliveries={ this.props.deliveries }
                  externalOrder={ this.props.externalOrders[row.externalorderId] || {} }
                  readOnly={ this.props.readOnly }
                  selectionCallback={ this.props.selectionCallback }
                  isSelectedCallback={ this.props.isSelectedCallback }
                  resetCallback={ this.props.resetCallback }
                  disableAddPurchaseNumber={ this.props.disableAddPurchaseNumber }
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
