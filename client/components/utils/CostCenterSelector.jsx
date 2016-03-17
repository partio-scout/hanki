var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Input = ReactBootstrap.Input;

var CostCenterSelector = React.createClass({
  propTypes: {
    costCenters: React.PropTypes.object,
  },

  getDefaultProps: function() {
    return {
      costCenters: { },
    };
  },

  render: function() {
    var costcenterOptions = _.map(this.props.costCenters, function(costCenter) {
      return (<option value={ costCenter.costcenterId } key={ costCenter.costcenterId }>
        { costCenter.code } { costCenter.name }
      </option>);
    });

    return (
      <Input type="select" {...this.props}>
        <option value="">Valitse kustannuspaikka...</option>
        { costcenterOptions }
      </Input>
    );
  },
});

module.exports = CostCenterSelector;
