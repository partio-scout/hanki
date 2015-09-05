var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var connectToStores = require('alt/utils/connectToStores');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Static = ReactBootstrap.FormControls.Static;
var Button = ReactBootstrap.Button;

var Router = require('react-router');

var Price = React.createClass({
  getDefaultProps: function() {
    return {
      value: 0
    }
  },

  render: function() {
    var price = 0;
    if (this.props.value) {
      price = this.props.value.toFixed(2).replace('.', ',');
    }

    return (
      <span>
        { price } €
      </span>
    );
  }
});

var getNewPurchaseOrderRow = function(PurchaseOrderActions, PurchaseOrderStore, TitleStore) {
  var newPurchaseOrderRow = React.createClass({
    mixins: [ Router.Navigation ],

    statics: {
      getStores() {
        return [ PurchaseOrderStore, TitleStore ]
      },

      getPropsFromStores() {
        console.log(TitleStore)
        return {
          purchaseOrders: PurchaseOrderStore.getState(),
          titles: TitleStore.getState()
        }
      }
    },

    getInitialState: function() {
      return {
        selectedTitleId: 0,
        amount: 0
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
        deliveryId: 0,
        memo: this.refs.memo.getValue(),
        orderId: 1 //TODO get from param
      }
      PurchaseOrderActions.createPurchaseOrderRow(row);
      this.transitionTo('my_purchase_orders');
    },

    onSelectedTitleChange: function() {
      this.setState({ selectedTitleId: this.refs.title.getValue() });
    },

    onAmountChange: function() {
      this.setState({ amount: this.refs.amount.getValue() });
    },

    render: function () {
      var titlegroups = this.props.titles.titleGroups || { };
      var titlesByGroup = _.groupBy(this.props.titles.titles, 'titlegroupId');
      var selectedTitle = this.props.titles.titles[this.state.selectedTitleId] || { };
      console.log('selected = ', selectedTitle, this.state.selectedTitleId)
      return (
        <Modal show='true' onHide={ this.onHide }>
          <Modal.Header closeButton>
            <Modal.Title>Lisää tuote</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-horizontal">
              <Input ref="title" type='select' label='Tuote' onChange={ this.onSelectedTitleChange } labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
                <option>Valitse...</option>
                {_.map(titlesByGroup, function(group, titlegroupId) {
                  return (
                    <optgroup label={ titlegroups[titlegroupId].name }>
                      {_.map(group, function(title) {
                        return <option value={ title.titleId }>{ title.name }</option>
                      })}
                    </optgroup>
                  );
                })}
              </Input>
              <Input defaultValue={ this.state.amount } ref="amount" onKeyUp={ this.onAmountChange } type='text' label='Määrä' labelClassName='col-xs-3' wrapperClassName='col-xs-9' addonAfter={ selectedTitle.unit } />
              <Static label="Yksikköhinta" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
                <Price value={ selectedTitle.priceWithTax } />
              </Static>
              <Static label="Yhteensä" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
                <Price value={ selectedTitle.priceWithTax * this.state.amount } />
              </Static>
              <Input ref="delivery" type='select' label='Toimitus' labelClassName='col-xs-3' wrapperClassName='col-xs-5'>

              </Input>
              <Static label="Tarveaika" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
                <div>
                  <label><input type="radio" name="needed_full_time" value="1" /> Koko leirin ajaksi</label>
                </div>
                <label><input type="radio" name="needed_full_time" value="0" /> Tarvitaan: </label>
                KALENTERI 1 - KALENTERI 2
              </Static>
              <Input ref="memo" type='textarea' label='Kommentti' help="Vapaaehtoinen" labelClassName='col-xs-3' wrapperClassName='col-xs-9' />
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

module.exports = getNewPurchaseOrderRow;
