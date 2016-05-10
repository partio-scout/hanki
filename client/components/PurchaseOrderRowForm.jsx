var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Static = ReactBootstrap.FormControls.Static;
var Button = ReactBootstrap.Button;
var ErrorMessages = require('./utils/ErrorMessages');
var Alert = ReactBootstrap.Alert;

var Price = require('./utils/Price');

var otherProductId = 0;

var PurchaseOrderRowForm = React.createClass({
  propTypes: {
    valueLinks: React.PropTypes.shape({
      selectedTitleId: React.PropTypes.object,
      selectedTitleGroup: React.PropTypes.object,
      amount: React.PropTypes.object,
      delivery: React.PropTypes.object,
      requestService: React.PropTypes.object,
      memo: React.PropTypes.object,
      nameOverride: React.PropTypes.object,
      priceOverride: React.PropTypes.object,
      unitOverride: React.PropTypes.object,
    }),
    titles: React.PropTypes.object,
    titleGroups: React.PropTypes.object,
    deliveries: React.PropTypes.object,
    validationErrors: React.PropTypes.array,
    onSave: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    title: React.PropTypes.string,
    prohibitChanges: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      titleGroups: { },
    };
  },

  isOtherProductSelected: function() {
    return 1 * this.props.valueLinks.selectedTitleGroup.value === otherProductId;
  },

  getTitleSelection: function() {
    if (this.isOtherProductSelected()) {
      return (
        <Input
          wrapperClassName="col-xs-12"
          defaultValue="Muu tuote"
          type="text"
          valueLink={ this.props.valueLinks.nameOverride }
          className="title-name"
        />
      );
    } else {
      var selectedTitleGroup = this.props.valueLinks.selectedTitleGroup.value;
      var titlesByGroup = _.groupBy(this.props.titles, 'titlegroupId');
      var titleOptions = _.map(titlesByGroup[selectedTitleGroup], title => <option value={ title.titleId }>{ title.name }</option>);

      return (
        <Input wrapperClassName="col-xs-12" valueLink={ this.props.valueLinks.selectedTitleId }
          type="select" onChange={ this.onSelectedTitleChange } className="title-selection">
          <option value="-1">Valitse tuote...</option>
          { titleOptions }
        </Input>
      );
    }
  },

  getPriceControl: function(selectedTitlePrice) {
    if (this.isOtherProductSelected()) {
      return (
        <Input label="Yksikköhinta"
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-5"
          defaultValue="0"
          type="number"
          lang="nb"
          step="0.01"
          addonAfter="€"
          valueLink={ this.props.valueLinks.priceOverride }
        />);
    } else {
      return (
        <Static label="Yksikköhinta" labelClassName="col-xs-3" wrapperClassName="col-xs-9">
          <Price value={ selectedTitlePrice } />
        </Static>);
    }
  },

  getUnitOverrideControl: function() {
    if (this.isOtherProductSelected()) {
      return (
        <Input type="select" wrapperClassName="col-xs-4" standalone valueLink={ this.props.valueLinks.unitOverride }>
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
      return <option value={ group.titlegroupId }>{ group.name }</option>;
    });

    var deliveryOptions = _.map(this.props.deliveries, function(delivery) {
      return <option value={ delivery.deliveryId }>{ delivery.description }</option>;
    });

    var unitPrice = this.isOtherProductSelected() ? this.props.valueLinks.priceOverride.value : selectedTitle.priceWithTax;
    var rowTotalPrice = unitPrice * this.props.valueLinks.amount.value;

    var editWarning = '';
    if (this.props.prohibitChanges) {
      editWarning = (
        <Alert bsStyle="warning">
          Tuotetta ei voi muokata, koska sillä on hyväksyntiä.
          Jos sinun tarvitsee muokata tilausta, ota yhteyttä hankintaan.
        </Alert>
      );
    }

    return (
      <Modal show="true" onHide={ this.props.onCancel }>
        <Modal.Header closeButton>
          <Modal.Title>{ this.props.title }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            { editWarning }
            <ErrorMessages messages={ this.props.validationErrors } />
            <Static label="Tuote" labelClassName="col-xs-3" wrapperClassName="col-xs-9 field">
              <Input type="select" valueLink={ this.props.valueLinks.selectedTitleGroup }
                wrapperClassName="col-xs-12" className="titlegroup-selection">
                <option value="-1">Valitse tuoteryhmä...</option>
                { titlegroupOptions }
              </Input>
              { this.getTitleSelection() }
            </Static>
            <div className="form-group">
              <Input valueLink={ this.props.valueLinks.amount } ref="amount" onKeyUp={ this.onAmountChange }
                type="text" standalone label="Määrä" labelClassName="col-xs-3" wrapperClassName="col-xs-5" addonAfter={ selectedTitle.unit }
              />
              { this.getUnitOverrideControl() }
            </div>
            { this.getPriceControl(selectedTitle.priceWithTax) }
            <Static label="Yhteensä" labelClassName="col-xs-3" wrapperClassName="col-xs-9">
              <Price value={ rowTotalPrice } />
            </Static>
            <Input valueLink={ this.props.valueLinks.delivery } type="select" label="Toimitus" labelClassName="col-xs-3" wrapperClassName="col-xs-5">
              <option value="">Valitse toimitusajankohta...</option>
              { deliveryOptions }
            </Input>
            <Input label="Palvelutilaus" labelClassName="col-xs-3" wrapperClassName="col-xs-9">
              <Input checkedLink={ this.props.valueLinks.requestService } type="checkbox" wrapperClassName="col-xs-12" label="Tuotteeseen liittyy palvelutilaus" help="Palvelutilaus syötetään erillisellä palvelutilauslomakkeella" />
            </Input>
            <Input valueLink={ this.props.valueLinks.memo } type="textarea" label="Kommentti" labelClassName="col-xs-3" wrapperClassName="col-xs-9"
              help="Vapaaehtoinen. Kerro tässä, jos tarvitset tuotetta vain osan aikaa leiristä. Mikäli tarvitset palvelua, voit kertoa tässä millaista palvelua tarvitset (esim. pystytys teltalle tai suunnittelu ja rakennus leiriportille). Voit myös lisätä muuta selventävää tietoa esim. tuotteen ominaisuuksista tähän kenttään."
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-center">
            <Button onClick={ this.props.onSave } bsStyle="primary" disabled={ this.props.prohibitChanges }>Tallenna</Button>
            <Button onClick={ this.props.onCancel }>Peruuta</Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  },
});

module.exports = PurchaseOrderRowForm;
