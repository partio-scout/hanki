var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Glyphicon = ReactBootstrap.Glyphicon;

var connectToStores = require('alt/utils/connectToStores');

var RouteHandler = require('react-router').RouteHandler;

var Reactable = require('reactable');
var Table = Reactable.Table;
var Thead = Reactable.Thead;
var Th = Reactable.Th;
var Tr = Reactable.Tr;
var Td = Reactable.Td;

var getAllPurchaseOrders = function(PurchaseOrderActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore) {
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
      PurchaseOrderActions.fetchAllPurchasseOrders();
    },

    render: function () {
      var titles = this.props.titles.titles || { };

      var orderRows = _.values(this.props.purchaseOrders.purchaseOrderRows || { });
      console.log(this.props)
      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Kaikki tilaukset
            </h1>
            <Table className="foo" itemsPerPage={ 20 }>
              { _.map(orderRows, function(orderRow) {
                var title = titles[orderRow.titleId] || { };

                return (
                  <Tr>
                    <Td column="Tilaaja">X</Td>
                    <Td column="Kohde">X</Td>
                    <Td column="Tuote">
                      <span>
                        <ButtonLink bsStyle="link" className="edit" to="all_purchase_orders_edit_row" params={ { purchaseOrderRow: orderRow.orderRowId } }>
                          <Glyphicon glyph="pencil" />
                        </ButtonLink>
                        <ButtonLink bsStyle="link" className="delete" to="all_purchase_orders_delete_row" params={ { purchaseOrderRow: orderRow.orderRowId } }>
                          <Glyphicon glyph="remove" />
                        </ButtonLink>
                        <span>T:
                          { title.titleId !== 0 ? title.name : orderRow.nameOverride }
                        </span> /
                        { orderRow.orderRowId }
                      </span>
                    </Td>
                    <Td column="Määrä">{ orderRow.amount }</Td>
                    <Td column="Summa">X</Td>
                    <Td column="Toimitus">X</Td>
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
