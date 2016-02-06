var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;
var ErrorMessages = require('./utils/ErrorMessages');

module.exports = React.createClass({
  propTypes: {
    formTitle: React.PropTypes.string.isRequired,
    titleGroups: React.PropTypes.object,
    validationErrors: React.PropTypes.arrayOf(React.PropTypes.string),
    unitSelectionDisabled: React.PropTypes.bool.isRequired,

    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,

    valueLinks: React.PropTypes.shape({
      name: React.PropTypes.object.isRequired,
      titlegroupId: React.PropTypes.object.isRequired,
      unit: React.PropTypes.object.isRequired,
      vatPercent: React.PropTypes.object.isRequired,
      priceWithTax: React.PropTypes.object.isRequired,
      memo: React.PropTypes.object.isRequired,
    }).isRequired,
  },

  getDefaultProps() {
    return {
      titleGroups: {},
      validationErrors: [],
    };
  },

  render() {
    var titlegroupOptions = _.map(this.props.titleGroups, group => <option value={ group.titlegroupId }>{ group.name }</option>);

    return (
      <Modal show="true" onHide={ this.props.onCancel }>
        <Modal.Header closeButton>
          <Modal.Title>{ this.props.formTitle }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <ErrorMessages messages={ this.props.validationErrors } />
            <Input label="Nimi" type="text" valueLink={ this.props.valueLinks.name } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Tuoteryhmä" type="select" valueLink={ this.props.valueLinks.titlegroupId } labelClassName="col-xs-3" wrapperClassName="col-xs-9">
              <option value="">Valitse...</option>
              { titlegroupOptions }
            </Input>
            <Input label="Yksikkö" type="text" disabled={ this.props.unitSelectionDisabled } valueLink={ this.props.valueLinks.unit } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="ALV-prosentti" type="select" valueLink={ this.props.valueLinks.vatPercent } labelClassName="col-xs-3" wrapperClassName="col-xs-9">
              <option value="">Valitse...</option>
              <option value="24">24%</option>
              <option value="14">14%</option>
              <option value="10">10%</option>
              <option value="0">0%</option>
            </Input>
            <Input label="Hinta (sis. alv)" type="number" valueLink={ this.props.valueLinks.priceWithTax } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
            <Input label="Kommentti" type="textarea" valueLink={ this.props.valueLinks.memo } labelClassName="col-xs-3" wrapperClassName="col-xs-9" />
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
