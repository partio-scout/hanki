var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var validatePurchaseOrderRow = require('../validation/purchaseOrderRow');

var connectToStores = require('alt/utils/connectToStores');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Static = ReactBootstrap.FormControls.Static;
var Button = ReactBootstrap.Button;
var ErrorMessages = require('./utils/ErrorMessages.jsx');

var Router = require('react-router');

var Price = require('./utils/Price.jsx');

var getNewPurchaseOrderRow = function(PurchaseOrderActions, PurchaseOrderStore, TitleStore, DeliveryStore) {
  var newPurchaseOrderRow = React.createClass({
    mixins: [ Router.Navigation ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore, TitleStore, DeliveryStore ]
      },

      getPropsFromStores() {
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          titles: TitleStore.getState(),
          deliveries: DeliveryStore.getState()
        }
      }
    },

    getInitialState: function() {
      return {
        selectedTitleGroup: '',
        selectedTitleId: '',
        amount: 0,
        memo: '',
        deliveryId: 0,
        validationErrors: [ ]
      }
    },

    onHide: function() {
      this.transitionTo('my_purchase_orders');
    },

    onSubmit: function() {
      var row = {
        titleId: this.state.selectedTitleId,
        amount: this.state.amount,
        approved: false,
        deliveryId: this.state.deliveryId,
        memo: this.state.memo,
        orderId: this.props.params.purchaseOrder
      };

      var validationErrors = validatePurchaseOrderRow(row);

      this.setState({ validationErrors: validationErrors });

      if (validationErrors.length === 0) {
        PurchaseOrderActions.createPurchaseOrderRow(row);
        this.transitionTo('my_purchase_orders');
      }
    },

    onSelectedTitleGroupChange: function(event) {
      this.setState({
        selectedTitleGroup: event.target.value,
        selectedTitleId: ''
      });
    },

    onSelectedTitleChange: function(event) {
      this.setState({ selectedTitleId: event.target.value });
    },

    onAmountChange: function(event) {
      this.setState({ amount: event.target.value });
    },

    onDeliveryIdChange: function(event) {
      this.setState({ deliveryId: event.target.value });
    },

    onMemoChange: function(event) {
      this.setState({ memo: event.target.value });
    },

    render: function () {
      var titlegroups = this.props.titles.titleGroups || { };
      var titlesByGroup = _.groupBy(this.props.titles.titles, 'titlegroupId');
      var selectedTitle = this.props.titles.titles[this.state.selectedTitleId] || { };
      var deliveries = this.props.deliveries.deliveries;

      var titleOptions = _.map(titlesByGroup[this.state.selectedTitleGroup], function(title) {
        return <option value={ title.titleId }>{ title.name }</option>
      });

      var titlegroupOptions = _.map(titlegroups, function(group) {
        return <option value={ group.titlegroupId }>{ group.name }</option>
      });

      var deliveryOptions = _.map(deliveries, function(delivery) {
        return <option value={ delivery.deliveryId }>{ delivery.description }</option>
      });

      return (
        <Modal show='true' onHide={ this.onHide }>
          <Modal.Header closeButton>
            <Modal.Title>Lisää tuote</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-horizontal">
              <ErrorMessages messages={ this.state.validationErrors } />

              <Static label="Tuote" labelClassName='col-xs-3' wrapperClassName='col-xs-9 field'>
                <Input value={ this.state.selectedTitleGroup } type='select' onChange={ this.onSelectedTitleGroupChange } wrapperClassName='col-xs-12'>
                  <option value="">Valitse tuoteryhmä...</option>
                  { titlegroupOptions }
                </Input>
                <Input value={ this.state.selectedTitleId } type='select' onChange={ this.onSelectedTitleChange } wrapperClassName='col-xs-12'>
                  <option value="">Valitse tuote...</option>
                  { titleOptions }
                </Input>
              </Static>
              <Input defaultValue='0'
                onKeyUp={ this.onAmountChange }
                type='text'
                label='Määrä'
                labelClassName='col-xs-3'
                wrapperClassName='col-xs-9'
                addonAfter={ selectedTitle.unit } />
              <Static label="Yksikköhinta" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
                <Price value={ selectedTitle.priceWithTax } />
              </Static>
              <Static label="Yhteensä" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
                <Price value={ selectedTitle.priceWithTax * this.state.amount } />
              </Static>
              <Input value={ this.state.deliveryId } onChange={ this.onDeliveryIdChange } type='select' label='Toimitus' labelClassName='col-xs-3' wrapperClassName='col-xs-5'>
                <option value="">Valitse toimitusajankohta...</option>
                { deliveryOptions }
              </Input>
              <Input
                type='textarea'
                onKeyUp={ this.onMemoChange }
                label='Kommentti'
                labelClassName='col-xs-3'
                wrapperClassName='col-xs-9'
                help='Vapaaehtoinen. Kerro tässä mikä valitsemasi "muu tuote" on ja esim. kuinka kauan tarvitset tuotetta tai tarvitsetko pystytystä tai muuta palvelua.' />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div className='text-center'>
              <Button onClick={ this.onSubmit } bsStyle='primary'>Tallenna</Button>
              <Button onClick={ this.onHide }>Peruuta</Button>
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  });

  return connectToStores(newPurchaseOrderRow);
};
//
module.exports = getNewPurchaseOrderRow;
