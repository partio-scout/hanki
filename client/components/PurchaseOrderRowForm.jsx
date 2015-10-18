var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Static = ReactBootstrap.FormControls.Static;
var Button = ReactBootstrap.Button;
var ErrorMessages = require('./utils/ErrorMessages.jsx');

var Price = require('./utils/Price.jsx');

var PurchaseOrderRowForm = React.createClass({
  getDefaultProps: function() {
    return {
      titleGroups: { }
    }
  },

  render: function () {
    var titlegroups = this.props.titleGroups;
    var titlesByGroup = _.groupBy(this.props.titles, 'titlegroupId');
    var selectedTitle = this.props.titles[this.props.valueLinks.selectedTitleId.value] || { };
    var deliveries = this.props.deliveries;

    var titleOptions = _.map(titlesByGroup[this.props.valueLinks.selectedTitleGroup.value], function(title) {
      return <option value={ title.titleId }>{ title.name }</option>
    });

    var titlegroupOptions = _.map(titlegroups, function(group) {
      return <option value={ group.titlegroupId }>{ group.name }</option>
    });

    var deliveryOptions = _.map(deliveries, function(delivery) {
      return <option value={ delivery.deliveryId }>{ delivery.description }</option>
    });

    return (
      <Modal show='true' onHide={ this.props.onCancel }>
        <Modal.Header closeButton>
          <Modal.Title>Lisää tuote</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <ErrorMessages messages={ this.props.validationErrors } />

            <Static label="Tuote" labelClassName='col-xs-3' wrapperClassName='col-xs-9 field'>
              <Input type='select' valueLink={ this.props.valueLinks.selectedTitleGroup } wrapperClassName='col-xs-12'>
                <option value="">Valitse tuoteryhmä...</option>
                { titlegroupOptions }
              </Input>
              <Input type='select' valueLink={ this.props.valueLinks.selectedTitleId } wrapperClassName='col-xs-12'>
                <option value="">Valitse tuote...</option>
                { titleOptions }
              </Input>
            </Static>
            <Input valueLink={ this.props.valueLinks.amount } ref="amount" onKeyUp={ this.onAmountChange } type='text' label='Määrä' labelClassName='col-xs-3' wrapperClassName='col-xs-9' addonAfter={ selectedTitle.unit } />
            <Static label="Yksikköhinta" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
              <Price value={ selectedTitle.priceWithTax } />
            </Static>
            <Static label="Yhteensä" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
              <Price value={ selectedTitle.priceWithTax * this.props.valueLinks.amount.value } />
            </Static>
            <Input valueLink={ this.props.valueLinks.delivery } type='select' label='Toimitus' labelClassName='col-xs-3' wrapperClassName='col-xs-5'>
              <option value="">Valitse toimitusajankohta...</option>
              { deliveryOptions }
            </Input>
            <Input valueLink={ this.props.valueLinks.memo } type='textarea' label='Kommentti' labelClassName='col-xs-3' wrapperClassName='col-xs-9'
              help='Vapaaehtoinen. Kerro tässä mikä valitsemasi "muu tuote" on ja esim. kuinka kauan tarvitset tuotetta tai tarvitsetko pystytystä tai muuta palvelua.' />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <div className='text-center'>
            <Button onClick={ this.props.onSave } bsStyle='primary'>Tallenna</Button>
            <Button onClick={ this.props.onCancel }>Peruuta</Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
});

module.exports = PurchaseOrderRowForm;
