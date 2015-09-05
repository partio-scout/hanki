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
        {this.props.purchaseOrders.map((purchaseOrder) => {
          var rows = _.filter(this.props.purchaseOrderRows, { orderId: purchaseOrder.orderId });
          return <PurchaseOrder key={ purchaseOrder.orderId } purchaseOrder={ purchaseOrder } purchaseOrderRows={ rows } />
        })}
      </div>
    );
  }
});
