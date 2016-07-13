var React = require('react');
var ReactAddons = require('react/addons').addons;
var Router = require('react-router');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;
var ErrorMessages = require('./utils/ErrorMessages');

var validateForm = require('../validation/otherProductArrivalForm');

var connectToStores = require('alt/utils/connectToStores');

var getOtherProductArrivalForm = function(PurchaseOrderActions, PurchaseOrderStore, TitleStore) {
  var OtherProductArrivalFormModal = React.createClass({
    propTypes: {
      row: React.PropTypes.object,
      title: React.PropTypes.object,
      onSave: React.PropTypes.func,
      onCancel: React.PropTypes.func,
      windowTitle: React.PropTypes.object,
      valueLinks: React.PropTypes.shape({
        amount: React.PropTypes.number,
        arrivalDate: React.PropTypes.string,
      }),
      validationErrors: React.PropTypes.array,
    },

    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    getDefaultProps: function() {
      return {
        row: {},
      };
    },

    render: function () {

      return (
        <Modal show="true" onHide={ this.props.onCancel }>
          <Modal.Header closeButton>
            <Modal.Title>{ this.props.windowTitle + ': ' + (this.props.row.nameOverride || this.props.title.name)  + ' ' + this.props.row.amount + ' ' + (this.props.row.unitOverride || this.props.title.unit) }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-horizontal">
              <ErrorMessages messages={ this.props.validationErrors } />
              <Input label="Saapumispäivämäärä" type="date" valueLink={ this.props.valueLinks.arrivalDate } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
              <Input label="Saapuneiden tuotteiden määrä" type="number" valueLink={ this.props.valueLinks.amount } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
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

  var OtherProductArrivalForm = React.createClass({
    propTypes: {
      params: React.PropTypes.object,
      rows: React.PropTypes.object,
      titles: React.PropTypes.object,
    },

    mixins: [ Router.Navigation, ReactAddons.LinkedStateMixin ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore, TitleStore ];
      },

      getPropsFromStores() {
        return {
          rows: PurchaseOrderStore.getState().purchaseOrderRows,
          titles: TitleStore.getState().titles,
        };
      },
    },

    getInitialState() {
      var row = this.props.rows[this.props.params.rowId];
      var state = {
        amount: row.arrivedAmount || row.amount,
        arrivalDate: '',
      };
      return state;
    },

    onCancel: function() {
      this.goBack();
    },

    onSave: function() {
      var formInfo = {
        amount: this.state.amount,
        arrivalDate: this.state.arrivalDate,
      };

      var validationErrors = validateForm(formInfo);
      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        var rowId = this.props.params.rowId;
        var arrivalDate = this.state.arrivalDate;
        var amount = this.state.amount;

        PurchaseOrderActions.setOtherProductArrivalDateAndAmount(rowId, arrivalDate, amount);
        this.goBack();
      }
    },

    render: function () {
      var valueLinks = {
        amount: this.linkState('amount'),
        arrivalDate: this.linkState('arrivalDate'),
      };

      return (
        <OtherProductArrivalFormModal
          windowTitle="Syötä saapuneiden tuotteiden määrä"
          onSave={ this.onSave }
          onCancel={ this.onCancel }
          row={ this.props.rows[this.props.params.rowId] }
          title={ this.props.titles[this.props.rows[this.props.params.rowId].titleId] || {} }
          valueLinks= { valueLinks }
          validationErrors={ this.state.validationErrors }
        />
      );
    },
  });

  return connectToStores(OtherProductArrivalForm);
};

module.exports = getOtherProductArrivalForm;
