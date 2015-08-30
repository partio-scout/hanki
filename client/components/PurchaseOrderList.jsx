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
        {this.props.purchaseOrders.map(function(purchaseOrder) {
          return <PurchaseOrder key={ purchaseOrder.orderId } purchaseOrder={ purchaseOrder } />
        })}
      </div>
    );
  }
});
