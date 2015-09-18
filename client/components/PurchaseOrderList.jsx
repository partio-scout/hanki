var _ = require('lodash');
var React = require('react');

var PurchaseOrder = require('./PurchaseOrder.jsx');

module.exports = React.createClass({
  getDefaultProps: function() {
    return {
      purchaseOrders: []
    };
  },

  render: function() {
    return (
      <div>
        {_(this.props.purchaseOrders).values().sortBy('orderId').reverse().map((purchaseOrder) => {
          var rows = _.filter(this.props.purchaseOrderRows, { orderId: purchaseOrder.orderId });
          var costCenter = this.props.costCenters[purchaseOrder.costcenterId] || { };
          var titles = this.props.titles || { };
          var deliveries = this.props.deliveries || { };

          return (
            <PurchaseOrder
              key={ purchaseOrder.orderId }
              purchaseOrder={ purchaseOrder }
              purchaseOrderRows={ rows }
              costCenter={ costCenter }
              titles={ titles }
              deliveries={ deliveries } />
          );
        }).value()}
      </div>
    );
  }
});
