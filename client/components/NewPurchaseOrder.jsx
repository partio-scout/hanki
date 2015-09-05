var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;

var Router = require('react-router');

var getNewPurchaseOrder = function(PurchaseOrderActions, CostCenterStore) {
  return React.createClass({
    mixins: [ Router.Navigation ],

    getInitialState() {
      return CostCenterStore.getState();
    },

    componentDidMount() {
      CostCenterStore.listen(this.onChange);
    },

    componentDidUnmount() {
      CostCenterStore.listen(this.onChange);
    },

    onChange(state) {
      this.setState(state);
    },

    onHide: function() {
      this.transitionTo('my_purchase_orders');
    },

    onSubmit: function() {
      var purchaseOrder = {
        name: this.refs.name.getValue(),
        costcenterId: this.refs.costcenterId.getValue()
      }
      PurchaseOrderActions.createPurchaseOrder(purchaseOrder);
      this.transitionTo('my_purchase_orders');
    },

    render: function () {
      return (
        <Modal show='true' onHide={ this.onHide }>
          <Modal.Header closeButton>
            <Modal.Title>Uusi tilaus</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-horizontal">
              <Input ref="costcenterId" type='select' label='Kustannuspaikka' labelClassName='col-xs-3' wrapperClassName='col-xs-9'>
                {_.map(this.state.costCenters, function(costCenter) {
                  return <option value={ costCenter.costcenterId }>{ costCenter.code } { costCenter.name }</option>
                })}
              </Input>
              <Input ref="name" type='text' label='Tilauksen nimi' labelClassName='col-xs-3' wrapperClassName='col-xs-9'
                help='Anna tilaukselle lyhyt ja käyttökohdetta kuvaava nimi, esim. "Vesilaakso/ympäristöpiste" tai "Kahvila Kuppikunta"' />
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
};

module.exports = getNewPurchaseOrder;
