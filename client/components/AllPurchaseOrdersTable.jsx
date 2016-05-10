var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var _ = require('lodash');

var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;

var Price = require('./utils/Price');

var Reactable = require('reactable');
var Table = Reactable.Table;
var Thead = Reactable.Thead;
var Th = Reactable.Th;
var Tr = Reactable.Tr;
var Td = Reactable.Td;

function getAllPurchaseOrdersTable(getAcceptanceStatus, restrictToRoles) {
  var ProcurementAcceptance = getAcceptanceStatus([ 'procurementMaster', 'procurementAdmin' ], restrictToRoles);
  var ProcurementButton = restrictToRoles([ 'procurementMaster', 'procurementAdmin' ], Button);

  var AllPurchaseOrdersTable = React.createClass({
    propTypes: {
      selectAllCallback: React.PropTypes.func,
      selectionCallback: React.PropTypes.func,
      resetCallback: React.PropTypes.func,
      isSelectedCallback: React.PropTypes.func,
      purchaseOrders: React.PropTypes.object,
      costCenters: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
      purchaseOrderRows: React.PropTypes.object,
    },

    selectAll: function() {
      this.props.selectAllCallback('procurement');
      return false;
    },

    render: function() {
      var titles = this.props.titles.titles || { };
      var orderRows = _(this.props.purchaseOrderRows || { })
        .values().sortBy('orderId').reverse().value();
      var purchaseOrders = this.props.purchaseOrders.allPurchaseOrders || { };
      return (
<<<<<<< HEAD
        <Table className="table table-striped all-orders-table" itemsPerPage={ 60 } sortable={ true }
          filterable={ [ 'Kohde', 'Tuote', 'Toimitus' ] } filterPlaceholder="Etsi rivejä">
          <Thead>
            <Th column="Kohde">Kohde</Th>
            <Th column="Tuote">Tuote</Th>
            <Th column="Hank.hyv.">
              Hank.hyv.
              <div>
                <ProcurementButton bsSize="xsmall" bsStyle="link" onClick={ this.selectAll }>
                  kaikki
                </ProcurementButton>
              </div>
            </Th>
            <Th column="Määrä">Määrä</Th>
            <Th column="Summa">Summa</Th>
            <Th column="Toimitus">Toimitus</Th>
          </Thead>
          { _.map(orderRows, (row) => {
            var purchaseOrder = purchaseOrders[row.orderId] || { };
            var costCenters = this.props.costCenters.allCostCenters || { };
            var costCenter = costCenters[purchaseOrder.costcenterId] || { };
            var title = titles[row.titleId] || { };
            var delivery = this.props.deliveries.deliveries[row.deliveryId] || { };
            var price = (row.priceOverride || title.priceWithTax) * row.amount;
            var titleName = row.nameOverride && ('Muu: ' + row.nameOverride) || title.name;

            var acceptanceValue = 0;
            if (row.providerApproval === true) {
              acceptanceValue = 1;
            }
            if (row.providerApproval === false) {
              acceptanceValue = 2;
            }

            return (
              <Tr key={ row.orderRowId }>
                //TODO Add orderer name column
                <Td column="Kohde" value={ costCenter.code + ' ' + purchaseOrder.name } className="order">
                  <div>
                    <div className="pull-left">
                      <div>{ costCenter.code }</div>
                      <div>{ purchaseOrder.name }</div>
                    </div>
                    <div className="pull-right">
                      <ButtonLink bsStyle="link" className="new" title="Luo uusi rivi tilaukseen"
                        to="all_purchase_orders_create_row" params={ { purchaseOrder: row.orderId } }>
                        <Glyphicon glyph="plus" />
                      </ButtonLink>
                    </div>
                  </div>
                </Td>
                <Td column="Tuote" value={ titleName } className="title">
                  <span>
                    <ButtonLink bsStyle="link" className="edit" to="all_purchase_orders_edit_row" params={ { purchaseOrderRow: row.orderRowId } }>
                      <Glyphicon glyph="pencil" />
                    </ButtonLink>
                    <ButtonLink bsStyle="link" className="delete" to="all_purchase_orders_delete_row" params={ { purchaseOrderRow: row.orderRowId } }>
                      <Glyphicon glyph="remove" />
                    </ButtonLink>
                    <span>
                      { titleName }
                    </span>
                  </span>
                </Td>
                <Td column="Hank.hyv." value={ acceptanceValue } className="acceptance">
                  <ProcurementAcceptance
                    onChange={ this.props.selectionCallback }
                    onReset={ this.props.resetCallback }
                    isSelectedCallback={ this.props.isSelectedCallback }
                    resetCallback={ this.props.resetCallback }
                    status={ row.providerApproval }
                    orderRowId={ row.orderRowId }
                    type="procurement"
                  />
                </Td>
                <Td column="Määrä" value={ row.amount } className="amount">
                  <span>{ row.amount } { row.unitOverride || title.unit }</span>
                </Td>
                <Td column="Summa" value={ price } className="price"><Price value={ price } /></Td>
                <Td column="Toimitus" value={ delivery.deliveryId } className="delivery"><span>{ delivery.name }</span></Td>
              </Tr>
            );
          }) }
        </Table>
      );
    },
  });

  return AllPurchaseOrdersTable;
}

module.exports = getAllPurchaseOrdersTable;
