var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;
var ErrorMessages = require('./utils/ErrorMessages');

module.exports = React.createClass({
  propTypes: {
    formTitle: React.PropTypes.string.isRequired,
    validationErrors: React.PropTypes.arrayOf(React.PropTypes.string),

    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,

    valueLinks: React.PropTypes.shape({
      supplierName: React.PropTypes.object.isRequired,
      externalorderId: React.PropTypes.object,
      businessId: React.PropTypes.object.isRequired,
      contactPerson: React.PropTypes.object,
      email: React.PropTypes.object,
      phone: React.PropTypes.object,
      customerNumber: React.PropTypes.object,
      deliveryTime: React.PropTypes.object,
      deliveryAddress: React.PropTypes.object,
      methodOfDelivery: React.PropTypes.object,
      termsOfDelivery: React.PropTypes.object,
      termsOfPayment: React.PropTypes.object,
      reference: React.PropTypes.object,
      memo: React.PropTypes.object,
    }).isRequired,

    canEditId: React.PropTypes.boolean,
  },

  getDefaultProps() {
    return {
      validationErrors: [],
    };
  },

  render() {

    return (
      <Modal show="true" onHide={ this.props.onCancel }>
        <Modal.Header closeButton>
          <Modal.Title>{ this.props.formTitle }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <ErrorMessages messages={ this.props.validationErrors } />
            <Input label="Tilausnumero" type="text" valueLink={ this.props.valueLinks.externalorderId } labelClassName="col-xs-3" wrapperClassName="col-xs-9" disabled={ !this.props.canEditId } />
            <Input label="* Toimittajan nimi" type="text" valueLink={ this.props.valueLinks.supplierName } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="* Toimittajan Y-tunnus" type="text" valueLink={ this.props.valueLinks.businessId } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Yhteyshenkilön nimi" type="text" valueLink={ this.props.valueLinks.contactPerson } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Yhteyshenkilön sähköpostiosoite" type="text" valueLink={ this.props.valueLinks.email } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Yhteyshenkilön puhelinnumero" type="text" valueLink={ this.props.valueLinks.phone } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Asiakastunnus" type="text" valueLink={ this.props.valueLinks.customerNumber } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Toimitusajankohta" type="text" valueLink={ this.props.valueLinks.deliveryTime } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Toimitusosoite" type="text" valueLink={ this.props.valueLinks.deliveryAddress } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Toimitustapa" type="text" valueLink={ this.props.valueLinks.methodOfDelivery } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Toimitusehto" type="text" valueLink={ this.props.valueLinks.termsOfDelivery } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Maksuehto" type="text" valueLink={ this.props.valueLinks.termsOfPayment } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Viite" type="text" valueLink={ this.props.valueLinks.reference } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Muistiinpano" type="textarea" valueLink={ this.props.valueLinks.memo } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
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
