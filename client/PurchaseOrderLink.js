var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Glyphicon = ReactBootstrap.Glyphicon;

var PurchaseOrderLink = React.createClass({
  render: function () {
    return (
      <div>
        Tässä on tilauksen nimi
        <Glyphicon glyph="pencil" />
      </div>
    );
  }
});

module.exports = PurchaseOrderLink;
