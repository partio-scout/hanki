var React = require('react');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Col = ReactBootstrap.Col;
var Button = ReactBootstrap.Button;

var connectToStores = require('alt/utils/connectToStores');

var getPurchaseOrderNumberForm = function(PurchaseOrderActions, PurchaseOrderStore) {
  var PurchaseOrderNumberFormModal = React.createClass({
    propTypes: {
      row: React.PropTypes.object,
      onSave: React.PropTypes.func,
      onCancel: React.PropTypes.func,
      title: React.PropTypes.object,
      valueLinks: React.PropTypes.shape({
        finalPrice: React.PropTypes.object,
        orderNumber: React.PropTypes.object,
        throughOwnBill: React.PropTypes.boolean,
      }),
    },

    getDefaultProps: function() {
      return {
        row: {},
      };
    },

    render: function () {

      return (
        <Modal show="true" onHide={ this.props.onCancel }>
          <Modal.Header closeButton>
            <Modal.Title>{ this.props.title }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-horizontal">
              <Col smOffset={ 3 } sm={ 9 }>
                <Input type="checkbox" label="Ostan itse ja teen kululaskun" checkedLink={ this.props.valueLinks.throughOwnBill } />
              </Col>
              <Input label="Tilausnumero" type="text" disabled={ this.props.valueLinks.throughOwnBill.value } valueLink={ this.props.valueLinks.orderNumber } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
              <Input label="Tilausrivin lopullinen kokonaishinta" addonAfter="€" valueLink={ this.props.valueLinks.finalPrice } type="text"  labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div className="text-center">
            <Button onClick={ this.props.onSave } bsStyle="primary">Tallenna</Button>
            <Button onClick={ this.props.onCancel }>Peruuta</Button>
            </div>
          </Modal.Footer>
        </Modal>
      );
    },
  });

  var PurchaseOrderNumberForm = React.createClass({
    propTypes: {
      params: React.PropTypes.object,
      rows: React.PropTypes.object,
    },

    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore ];
      },

      getPropsFromStores() {
        return {
          rows: PurchaseOrderStore.getState().purchaseOrderRows,
        };
      },
    },

    getInitialState() {
      var row = this.props.rows[this.props.params.rowId];
      var state = {
        finalPrice: row.amount * row.priceOverride,
        orderNumber: row.purchaseOrderNumber || '',
        throughOwnBill: false,
      };
      return state;
    },

    onCancel: function() {
      this.transitionTo('my_purchase_orders');
    },

    onSave: function() {
      var orderNumber = this.state.throughOwnBill ? '100' : this.state.orderNumber;
      var finalPrice = this.state.finalPrice;
      var rowId = this.props.params.rowId;

      PurchaseOrderActions.setOtherProductFinalPriceAndPurchaseOrderNumber(rowId, finalPrice, orderNumber);
      this.transitionTo('my_purchase_orders');
    },

    render: function () {
      var valueLinks = {
        finalPrice: this.linkState('finalPrice'),
        orderNumber: this.linkState('orderNumber'),
        throughOwnBill: this.linkState('throughOwnBill'),
      };

      return (
        <PurchaseOrderNumberFormModal
          title="Syötä tilausnumero"
          onSave={ this.onSave }
          onCancel={ this.onCancel }
          row={ this.props.rows[this.props.params.rowId] }
          valueLinks= { valueLinks }
        />
      );
    },
  });

  return connectToStores(PurchaseOrderNumberForm);
};

module.exports = getPurchaseOrderNumberForm;
