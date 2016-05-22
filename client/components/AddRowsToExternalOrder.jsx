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

    componentWillMount() {
      this.filter = _.debounce(this.filter,200);
      this.setState(this.getCurrentRows());
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

    filter(filter) {
      this.setState(this.getCurrentRows(filter));
    },

    getCurrentRows(filter) {
      filter = filter.toLowerCase();
      var finalizedRows = _.filter(this.props.rows, function(row) {
        if (row.externalorderId || row.deliveryId === 1) {
          return false;
        }
        if (!filter) {
          return true;
        }
        if (row.titleId) {
          return row.title.name.toLowerCase().indexOf(filter) > -1;
        } else {
          return !!row.nameOverride && ('Muu: ' + row.nameOverride).toLowerCase().indexOf(filter) > -1;
        }
      });
      finalizedRows = finalizedRows.slice(0,60);
      finalizedRows = _.indexBy(finalizedRows, 'orderRowId');
      return { rows: finalizedRows };
    },

    handleChange: function(event) {
      var filter = event.target.value;
      this.filter(filter);
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
            <input type="text" onChange={ this.handleChange } />
            <table className="table table-striped" itemsPerPage={ 60 } sortable={ true }
              filterable={ [ 'Tuote', 'Kohde' ] } filterPlaceholder="Etsi rivejä" >
              <tbody>
                {
                  _(this.state.rows)
                    .filter(row => {
                      return (!row.externalorderId && row.deliveryId !== 1);
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
                        <tr key={ row.orderRowId }>
                          <td column="">
                            <AddRowButton rowId={ row.orderRowId } rowAdded={ this.addRow } />
                          </td>
                          <td column="Tuote" value={ name }>
                            <div>
                              { name }
                            </div>
                          </td>
                          <td column="Määrä">
                            <span>
                              { row.amount } { row.unitOverride || title.unit || ' ' }
                            </span>
                          </td>
                          <td column="Hinta" value={ price } className="price"><Price value={ price } /></td>
                          <td column="Päällikkö">
                            { row.userSectionApproval ? <Glyphicon glyph="ok" bsClass="glyphicon accepted" /> : <Glyphicon glyph="ban-circle"/> }
                          </td>
                          <td column="Hankinta">
                            { row.providerApproval ? <Glyphicon glyph="ok" bsClass="glyphicon accepted" /> : <Glyphicon glyph="ban-circle"/> }
                          </td>
                          <td column="Talous">
                            { row.controllerApproval ? <Glyphicon glyph="ok" bsClass="glyphicon accepted" /> : <Glyphicon glyph="ban-circle" bsClass="glyphicon rejected"/> }
                          </td>
                          <td column="Huomiot">
                            { comment }
                          </td>
                          <td column="Toimitustapa">
                            { delivery.name }
                          </td>
                          <td column="Kohde" value={ costcenter.code + ' ' + order.name }>
                            <div className="pull-left">
                              <div>{ costcenter.code }</div>
                              <div>{ order.name }</div>
                            </div>
                          </td>
                        </tr>
                      );
                    }).value()
                }
                </tbody>
            </table>
          </Modal.Body>
        </Modal>
      );
    },
  }));

  return AddRowsToExternalOrder;
}

module.exports = getAddRowsToExternalOrder;
