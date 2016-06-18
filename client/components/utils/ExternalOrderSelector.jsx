var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Input = ReactBootstrap.Input;

var ExternalOrderSelector = React.createClass({
  propTypes: {
    externalOrders: React.PropTypes.object,
  },

  getDefaultProps: function() {
    return {
      externalOrders: { },
    };
  },

  render: function() {
    var externalOrderOptions = _.map(this.props.externalOrders, function(externalOrder) {
      return (<option value={ externalOrder.externalorderId } key={ externalOrder.externalorderId }>
        { externalOrder.externalorderCode } { externalOrder.supplierName }
      </option>);
    });

    return (
      <Input type="select" {...this.props}>
        <option value="">Valitse ulkoinen tilaus...</option>
        { externalOrderOptions }
      </Input>
    );
  },
});

module.exports = ExternalOrderSelector;
