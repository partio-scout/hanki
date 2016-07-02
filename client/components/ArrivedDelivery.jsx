var _ = require('lodash');
var React = require('react');
var ReactAddons = require('react/addons').addons;
var ReactBootstrap = require('react-bootstrap');

var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var Glyphicon = ReactBootstrap.Glyphicon;

var ErrorMessages = require('./utils/ErrorMessages');
var validateArrivedDelivery = require('../validation/arrivedDelivery');

function getArrivedDelivery(ArrivedDeliveryActions) {
  var ArrivedDeliveryTableRow = React.createClass({
    mixins: [ ReactAddons.LinkedStateMixin ],

    propTypes: {
      row: React.PropTypes.object,
      amount: React.PropTypes.object,
      finalDelivery: React.PropTypes.bool,
      title: React.PropTypes.object,
      order: React.PropTypes.object,
      costCenter: React.PropTypes.object,
      onArrivedAmountChange: React.PropTypes.func,
      onFinalDeliveryChange: React.PropTypes.func,
    },

    getInitialState() {
      return {
        amount: this.props.amount,
        finalDelivery: this.props.finalDelivery,
      };
    },

    componentWillReceiveProps(newProps) {
      this.setState({
        amount: newProps.amount,
        finalDelivery: newProps.finalDelivery,
      });
    },

    onArrivedAmountChange(e) {
      this.setState({ amount: e.target.value });
      this.props.onArrivedAmountChange(this.props.row.orderRowId, e.target.value);
    },

    onFinalDeliveryChange(e) {
      this.setState({ finalDelivery: e.target.checked });
      this.props.onFinalDeliveryChange(this.props.row.orderRowId, e.target.checked);
    },

    render: function() {
      var arrivedAmountInput = '';
      var lastDeliveryCheckbox = '';
      if (this.props.row.arrivedStatus != 'ARRIVED') {
        arrivedAmountInput = (
          <Input type="text" value={ this.state.amount } onChange={ this.onArrivedAmountChange } wrapperClassName="col-xs-4" />
        );
        lastDeliveryCheckbox = (
          <Input type="checkbox" checked={ this.state.finalDelivery } onChange={ this.onFinalDeliveryChange } wrapperClassName="col-xs-3"/>
        );
      } else {
        lastDeliveryCheckbox = (
          <span> <Glyphicon glyph="ok" bsClass="glyphicon accepted" /> </span>
        );
      }

      return (
        <tr>
          <th>{ this.props.row.nameOverride || this.props.title.name }</th>
          <th>{ this.props.costCenter.code } { this.props.order.name }</th>
          <th>{ this.props.row.amount } { this.props.row.unitOverride || this.props.title.unit }</th>
          <th>{ this.props.row.arrivedAmount || 0 } { this.props.row.unitOverride || this.props.title.unit }</th>
          <th>{ arrivedAmountInput }</th>
          <th>{ lastDeliveryCheckbox }</th>
        </tr>
      );
    },
  });

  var ArrivedDelivery = React.createClass({
    mixins: [ ReactAddons.LinkedStateMixin ],

    propTypes: {
      externalOrder: React.PropTypes.object,
      purchaseOrderRows: React.PropTypes.object,
      purchaseOrders: React.PropTypes.object,
      costCenters: React.PropTypes.object,
      titles: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
      onDone: React.PropTypes.func,
    },

    getDefaultProps: function() {
      return {
        readOnly: false,
      };
    },

    createDeliveryRowArray: function(orderRow) {
      return {
        orderRowId: orderRow.orderRowId,
        amount: orderRow.amount - orderRow.arrivedAmount,
        finalDelivery: false,
      };
    },

    getInitialState: function() {
      return {
        arrivalDate: null,
        memo: '',
        deliveryRows: _.map(this.props.purchaseOrderRows, this.createDeliveryRowArray),
      };
    },

    componentWillReceiveProps(newProps) {
      this.setState({ deliveryRows: _.map(newProps.purchaseOrderRows, this.createDeliveryRowArray) });
    },

    onArrivedAmountChange(rowId, arrivedAmount) {
      var index = _.findIndex(this.state.deliveryRows, { orderRowId: rowId });
      var deliveryRows = this.state.deliveryRows;
      deliveryRows[index].amount = arrivedAmount;
      this.setState({ deliveryRows: deliveryRows });
    },

    onFinalDeliveryChange(rowId, finalDelivery) {
      var index = _.findIndex(this.state.deliveryRows, { orderRowId: rowId });
      var deliveryRows = this.state.deliveryRows;
      deliveryRows[index].finalDelivery = finalDelivery;
      this.setState({ deliveryRows: deliveryRows });
    },

    onSave: function() {
      var arrivedDelivery = {
        arrivalDate: this.state.arrivalDate,
        memo: this.state.memo,
        externalorderId: this.props.externalOrder.externalorderId,
      };

      var validationErrors = validateArrivedDelivery(arrivedDelivery);

      this.setState({ validationErrors: validationErrors });

      // don't want to create row if nothing is delivered and delivery isn't final delivery
      var deliveryRows = _.filter(this.state.deliveryRows, function(r) {
        return !(!r.amount && !r.finalDelivery);
      });

      if (validationErrors.length === 0) {
        ArrivedDeliveryActions.createArrivedDeliveryWithRows(arrivedDelivery, deliveryRows);
        this.props.onDone();
      }
    },

    selectAllFinalDeliveries() {
      var deliveryRows = _.map(this.state.deliveryRows, function(row) {
        row.finalDelivery = true;
        return row;
      });
      this.setState({ deliveryRows: deliveryRows });
    },

    emptyAllAmounts() {
      var deliveryRows = _.map(this.state.deliveryRows, function(row) {
        row.amount = 0;
        return row;
      });
      this.setState({ deliveryRows: deliveryRows });
    },

    render: function() {
      var valueLinks = {
        arrivalDate: this.linkState('arrivalDate'),
        memo: this.linkState('memo'),
      };

      var saveButton = (
        <Button bsStyle="primary" onClick={ this.onSave } className="save" ><span> Tallenna </span> </Button>
      );

      var checkAllFinalDeliveriesButton = (
        <Button bsStyle="link" bsSize="xsmall" onClick={ this.selectAllFinalDeliveries } ><span> Valitse kaikki </span> </Button>
      );

      var emptyAllAmountsButton = (
        <Button bsStyle="link" bsSize="xsmall" onClick={ this.emptyAllAmounts } ><span> Tyhjennä kaikki </span> </Button>
      );

      return (
        <div>
          { saveButton }
          <form className="form-horizontal">
            <ErrorMessages messages={ this.state.validationErrors } />
            <Input type="date" label="Saapumispäivä " valueLink={ valueLinks.arrivalDate } labelClassName="col-xs-9" wrapperClassName="col-xs-3"/>
          </form>
          <Table>
            <thead>
              <tr>
                <th>Tuote</th>
                <th>Tilaus</th>
                <th>Tilattu</th>
                <th>Tullut</th>
                <th>Saapui <span>{ emptyAllAmountsButton }</span></th>
                <th>Viimeinen erä <span>{ checkAllFinalDeliveriesButton }</span></th>
              </tr>
            </thead>
            <tbody>
            {
              _.map(this.props.purchaseOrderRows, row =>
                <ArrivedDeliveryTableRow
                  row={ row }
                  title={ this.props.titles[row.titleId] || {} }
                  order={ this.props.purchaseOrders[row.orderId] }
                  costCenter={ this.props.costCenters[this.props.purchaseOrders[row.orderId].costcenterId] }
                  amount={ (_.find(this.state.deliveryRows, { orderRowId: row.orderRowId })).amount }
                  finalDelivery={ (_.find(this.state.deliveryRows, { orderRowId: row.orderRowId })).finalDelivery }
                  onArrivedAmountChange={ this.onArrivedAmountChange }
                  onFinalDeliveryChange={ this.onFinalDeliveryChange }
                />
              )
            }
            </tbody>
          </Table>
          <form className="form-horizontal">
            <Input type="textarea" label="Kommentti" valueLink={ valueLinks.memo } labelClassName="col-xs-8" wrapperClassName="col-xs-4"/>
          </form>
          { saveButton }
        </div>
      );
    },
  });

  return ArrivedDelivery;
}

module.exports = getArrivedDelivery;
