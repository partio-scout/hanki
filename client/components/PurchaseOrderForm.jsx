var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;
var ErrorMessages = require('./utils/ErrorMessages');

var PurchaseOrderForm = React.createClass({
  propTypes: {
    costCenters: React.PropTypes.object,
    purchaseOrder: React.PropTypes.object,
    onSave: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    title: React.PropTypes.string,
    valueLinks: React.PropTypes.shape({
      costcenterId: React.PropTypes.object,
      name: React.PropTypes.object,
    }),
    validationErrors: React.PropTypes.array,
  },

  getDefaultProps: function() {
    return {
      costCenters: { },
      purchaseOrder: { },
    };
  },

  render: function () {
    var costcenterOptions = _.map(this.props.costCenters, function(costCenter) {
      return (<option value={ costCenter.costcenterId } key={ costCenter.costcenterId }>
        { costCenter.code } { costCenter.name }
      </option>);
    });

    return (
      <Modal show="true" onHide={ this.props.onCancel }>
        <Modal.Header closeButton>
          <Modal.Title>{ this.props.title }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <ErrorMessages messages={ this.props.validationErrors } />
            <Input
              ref="costcenterId"
              type="select"
              label="Kustannuspaikka"
              valueLink={ this.props.valueLinks.costcenterId }
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-9">
              <option value="">Valitse kustannuspaikka...</option>
              { costcenterOptions }
            </Input>
            <Input
              ref="name"
              type="text"
              label="Tilauksen nimi"
              valueLink={ this.props.valueLinks.name }
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-9"
              help='Anna tilaukselle lyhyt ja käyttökohdetta kuvaava nimi, esim. "Vesilaakso/ympäristöpiste" tai "Kahvila Kuppikunta"'
            />
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

module.exports = PurchaseOrderForm;
