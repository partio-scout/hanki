var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;

var PurchaseOrderRow = React.createClass({
  render: function () {
    return (
      <div>
        Tilausrivi.
      </div>
    );
  }
});

var PurchaseOrder = React.createClass({
  render: function () {
    return (
      <Panel>
        <h2>
          00000 Tilauksen nimi
        </h2>
        <PurchaseOrderRow />
        <PurchaseOrderRow />
      </Panel>
    );
  }
});

module.exports = PurchaseOrder;
