var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Static = ReactBootstrap.FormControls.Static;
var Button = ReactBootstrap.Button;
var ErrorMessages = require('./utils/ErrorMessages.jsx');

var Price = require('./utils/Price.jsx');

var otherProductId = 0;

var PurchaseOrderRowForm = React.createClass({
  getDefaultProps: function() {
    return {
      titleGroups: { }
    }
  },

  isOtherProductSelected: function() {
    return 1 * this.props.valueLinks.selectedTitleGroup.value === otherProductId;
  },

  getTitleSelection: function() {
    if (this.isOtherProductSelected()) {
      return (<Input wrapperClassName='col-xs-12' defaultValue='Muu tuote' type='text' valueLink={ this.props.valueLinks.nameOverride } />);
    } else {
      var selectedTitleGroup = this.props.valueLinks.selectedTitleGroup.value;
      var titlesByGroup = _.groupBy(this.props.titles, 'titlegroupId');
      var titleOptions = _.map(titlesByGroup[selectedTitleGroup], function(title) {
        return <option value={ title.titleId }>{ title.name }</option>
      });

      return (
        <Input wrapperClassName='col-xs-12' valueLink={ this.props.valueLinks.selectedTitleId } type='select' onChange={ this.onSelectedTitleChange }>
          <option value="-1">Valitse tuote...</option>
          { titleOptions }
        </Input>);
    }
  },

  getPriceControl: function(selectedTitlePrice) {
    if (this.isOtherProductSelected()) {
      return (
        <Input label="Yksikköhinta"
          labelClassName='col-xs-3'
          wrapperClassName='col-xs-5'
          defaultValue='0'
          type='text'
          valueLink={this.props.valueLinks.priceOverride} />);
    } else {
      return (
        <Static label="Yksikköhinta" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
          <Price value={ selectedTitlePrice } />
        </Static>);
    }
  },

  getUnitOverrideControl: function() {
    if (this.isOtherProductSelected()) {
      return (
        <Input type="select" wrapperClassName='col-xs-4' standalone valueLink={ this.props.valueLinks.unitOverride }>
          <option value="">Valitse yksikkö...</option>
          <option value="kpl">kpl</option>
          <option value="l">l</option>
          <option value="kg">kg</option>
          <option value="m">m</option>
          <option value="m2">m2</option>
          <option value="m3">m3</option>
        </Input>
      );
    } else {
      return null;
    }
  },

  render: function () {
    var selectedTitle = this.props.titles[this.props.valueLinks.selectedTitleId.value] || { };

    var titlegroupOptions = _.map(this.props.titleGroups, function(group) {
      return <option value={ group.titlegroupId }>{ group.name }</option>
    });

    var deliveryOptions = _.map(this.props.deliveries, function(delivery) {
      return <option value={ delivery.deliveryId }>{ delivery.description }</option>
    });

    var unitPrice = this.isOtherProductSelected() ? this.props.valueLinks.priceOverride.value : selectedTitle.priceWithTax;
    var rowTotalPrice = unitPrice * this.props.valueLinks.amount.value;

    return (
      <Modal show='true' onHide={ this.props.onCancel }>
        <Modal.Header closeButton>
          <Modal.Title>{ this.props.title }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <ErrorMessages messages={ this.props.validationErrors } />

            <Static label="Tuote" labelClassName='col-xs-3' wrapperClassName='col-xs-9 field'>
              <Input type='select' valueLink={ this.props.valueLinks.selectedTitleGroup } wrapperClassName='col-xs-12'>
                <option value="-1">Valitse tuoteryhmä...</option>
                { titlegroupOptions }
              </Input>
              { this.getTitleSelection() }
            </Static>
            <div className="form-group">
              <Input valueLink={ this.props.valueLinks.amount } ref="amount" onKeyUp={ this.onAmountChange }
                type='text' standalone label='Määrä' labelClassName='col-xs-3' wrapperClassName='col-xs-5' addonAfter={ selectedTitle.unit } />
              { this.getUnitOverrideControl() }
            </div>
            { this.getPriceControl(selectedTitle.priceWithTax) }
            <Static label="Yhteensä" labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
              <Price value={ rowTotalPrice } />
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
