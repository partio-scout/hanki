var _ = require('lodash');
var React = require('react');
var connectToStores = require('alt/utils/connectToStores');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');
var ReactBootstrap = require('react-bootstrap');

var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Modal = ReactBootstrap.Modal;

var Reactable = require('reactable');
var Table = Reactable.Table;
var Tr = Reactable.Tr;
var Td = Reactable.Td;

var Price = require('./utils/Price');

function getAddRowsToExternalOrder(PurchaseOrderStore, TitleStore, CostCenterStore, PurchaseOrderActions, ExternalOrderActions, DeliveryStore) {
  var AddRowButton = React.createClass({
    propTypes: {
      rowId: React.PropTypes.number,
      rowAdded: React.PropTypes.func,
    },

    addRow() {
      this.props.rowAdded(this.props.rowId);
    },

    render() {
      return (
        <Button onClick={ this.addRow } className="row-inline add-row"><span> <Glyphicon glyph="plus" /> </span> </Button>
      );
    },
  });

  var AddRowsToExternalOrder = connectToStores(React.createClass({
    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    propTypes: {
      rows: React.PropTypes.object,
      params: React.PropTypes.object,
      titles: React.PropTypes.object,
      purchaseOrders: React.PropTypes.object,
      costcenters: React.PropTypes.object,
      deliveries: React.PropTypes.object,
    },

    statics: {
      getStores() {
        return [ PurchaseOrderStore, TitleStore, DeliveryStore ];
      },

      getPropsFromStores() {
        return {
          rows: PurchaseOrderStore.getState().purchaseOrderRows,
          titles: TitleStore.getState().titles,
          purchaseOrders: PurchaseOrderStore.getState().allPurchaseOrders,
          costcenters: CostCenterStore.getState().allCostCenters,
          deliveries: DeliveryStore.getState().deliveries,
        };
      },
    },

    onClose: function() {
      ExternalOrderActions.fetchExternalOrders();
      this.transitionTo('external_orders');
    },

    addRow(rowId) {
      var row = this.props.rows[rowId];
      row.externalorderId = this.props.params.externalorderId;
      PurchaseOrderActions.updatePurchaseOrderRow(row);
    },

    render: function() {
      return (
        <Modal bsSize="lg" show="true" onHide={ this.onClose }>
          <Modal.Header>
            <h3>
              <span>Lisää rivejä tilaukseen</span>
              <Button bsStyle="inline pull-right" onClick={ this.onClose }>Sulje</Button>
            </h3>
          </Modal.Header>
          <Modal.Body>
            <Table className="table table-striped" itemsPerPage={ 60 } sortable={ true }
              filterable={ [ 'Tuote', 'Kohde' ] } filterPlaceholder="Etsi rivejä" >
                {
                  _(this.props.rows)
                    .filter(row => {
                      return (!row.externalorderId || row.externalorderId === 0) && row.deliveryId !== 1;
                    })
                    .map(row => {
                      var title = this.props.titles[row.titleId] || {};
                      var order = this.props.purchaseOrders[row.orderId] || {};
                      var costcenter = this.props.costcenters[order.costcenterId] || {};
                      var price = (row.priceOverride || title.priceWithTax) * row.amount;
                      var delivery = this.props.deliveries[row.deliveryId] || {};
                      var name = (row.nameOverride) ? 'Muu tuote: ' + row.nameOverride : title.name;

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
                        <Tr key={ row.orderRowId }>
                          <Td column="">
                            <AddRowButton rowId={ row.orderRowId } rowAdded={ this.addRow } />
                          </Td>
                          <Td column="Tuote" value={ name }>
                            <div>
                              { name }
                            </div>
                          </Td>
                          <Td column="Määrä">
                            <span>
                              { row.amount } { row.unitOverride || title.unit || ' ' }
                            </span>
                          </Td>
                          <Td column="Hinta" value={ price } className="price"><Price value={ price } /></Td>
                          <Td column="Päällikkö">
                            { row.userSectionApproval ? <Glyphicon glyph="ok" bsClass="glyphicon accepted" /> : <Glyphicon glyph="ban-circle"/> }
                          </Td>
                          <Td column="Hankinta">
                            { row.providerApproval ? <Glyphicon glyph="ok" bsClass="glyphicon accepted" /> : <Glyphicon glyph="ban-circle"/> }
                          </Td>
                          <Td column="Talous">
                            { row.controllerApproval ? <Glyphicon glyph="ok" bsClass="glyphicon accepted" /> : <Glyphicon glyph="ban-circle" bsClass="glyphicon rejected"/> }
                          </Td>
                          <Td column="Huomiot">
                            { comment }
                          </Td>
                          <Td column="Toimitustapa">
                            { delivery.name }
                          </Td>
                          <Td column="Kohde" value={ costcenter.code + ' ' + order.name }>
                            <div className="pull-left">
                              <div>{ costcenter.code }</div>
                              <div>{ order.name }</div>
                            </div>
                          </Td>
                        </Tr>
                      );
                    }).value()
                }
            </Table>
          </Modal.Body>
        </Modal>
      );
    },
  }));

  return AddRowsToExternalOrder;
}

module.exports = getAddRowsToExternalOrder;
