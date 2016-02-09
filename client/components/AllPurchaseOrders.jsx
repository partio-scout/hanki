var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var _ = require('lodash');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;

var Price = require('./utils/Price');

var connectToStores = require('alt/utils/connectToStores');

var RouteHandler = require('react-router').RouteHandler;

var Reactable = require('reactable');
var Table = Reactable.Table;
var Tr = Reactable.Tr;
var Td = Reactable.Td;

var getAllPurchaseOrders = function(accessToken, PurchaseOrderActions, CostCenterActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore) {
  var allPurchaseOrders = React.createClass({
    propTypes: {
      purchaseOrders: React.PropTypes.object,
      costCenters: React.PropTypes.object,
      titles: React.PropTypes.object,
      deliveries: React.PropTypes.object,
    },

    statics: {
      getStores() {
        return [ PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore ];
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          costCenters: CostCenterStore.getState(),
          titles: TitleStore.getState(),
          deliveries: DeliveryStore.getState(),
        };
      },
    },

    componentDidMount: function() {
      PurchaseOrderActions.fetchAllPurchaseOrders();
      CostCenterActions.fetchAllCostCenters();
    },

    render: function () {
      var titles = this.props.titles.titles || { };
      var orderRows = _.values(this.props.purchaseOrders.purchaseOrderRows || { });
      var purchaseOrders = this.props.purchaseOrders.allPurchaseOrders || { };

      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Kaikki tilaukset
            </h1>
            <Button href={ '/api/Purchaseorderrows/CSVExport?access_token=' + accessToken.id } bsStyle="primary">
              <Glyphicon glyph="download-alt" />
              <span> Lataa kaikki tilaukset</span>
            </Button>
            <Table className="table table-striped all-orders-table" itemsPerPage={ 60 } sortable={ true }
              filterable={ [ 'Kohde', 'Tuote', 'Toimitus' ] } filterPlaceholder="Etsi rivejä">
              { _.map(orderRows, (row) => {
                var purchaseOrder = purchaseOrders[row.orderId] || {};
                var costCenter = this.props.costCenters.costCenters[purchaseOrder.costcenterId] || { };
                var title = titles[row.titleId] || { };
                var delivery = this.props.deliveries.deliveries[row.deliveryId] || { };
                var price = (row.priceOverride || title.priceWithTax) * row.amount;
                var titleName = row.nameOverride && ('Muu: ' + row.nameOverride) || title.name;
                return (
                  <Tr key={ row.orderRowId }>
                    //TODO Add orderer name column
                    <Td column="Kohde" value={ costCenter.code + ' ' + purchaseOrder.name } className="order">
                      <div>
                        <div>{ costCenter.code }</div>
                        <div>{ purchaseOrder.name }</div>
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
                    <Td column="Määrä" value={ row.amount } className="amount">
                      <span>{ row.amount } { row.unitOverride || title.unit }</span>
                    </Td>
                    <Td column="Summa" value={ price } className="price"><Price value={ price } /></Td>
                    <Td column="Toimitus" value={ delivery.deliveryId } className="delivery"><span>{ delivery.name }</span></Td>
                  </Tr>
                );
              }) }
            </Table>
          </Col>
        </Row>
      );
    },
  });

  return connectToStores(allPurchaseOrders);
};

module.exports = getAllPurchaseOrders;
