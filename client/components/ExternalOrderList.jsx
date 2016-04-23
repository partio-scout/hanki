var _ = require('lodash');
var React = require('react');

function getExternalOrderList(ExternalOrder) {
  var ExternalOrderList = React.createClass({
    propTypes: {
      externalOrders: React.PropTypes.object,
      orderrows: React.PropTypes.object,
      readOnly: React.PropTypes.bool,
    },

    getDefaultProps: function() {
      return {
        externalOrders: [],
        readOnly: false,
      };
    },

    render: function() {
      if (this.props.externalOrders && this.props.externalOrders.length === 0) {
        return <div>Ei ulkoisia tilauksia.</div>;
      }

      return (
        <div>
          {
            _(this.props.externalOrders)
              .values()
              .sortBy('externalorderId')
              .reverse()
              .map((externalOrder) => {
                var rows = _.filter(this.props.orderRows, { externalorderId: externalOrder.externalorderId });

                return (
                  <ExternalOrder
                    key={ externalOrder.externalorderId }
                    externalOrder={ externalOrder }
                    orderRows={ rows }
                    readOnly={ this.props.readOnly }
                  />
                );
              })
              .value()
          }
        </div>
      );
    },
  });

  return ExternalOrderList;
}

module.exports = getExternalOrderList;
