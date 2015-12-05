var React = require('react');

var Price = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
  },

  getDefaultProps: function() {
    return {
      value: 0,
    };
  },

  render: function() {
    var price = 0;
    if (this.props.value) {
      price = this.props.value.toFixed(2).replace('.', ',');
    }

    return (
      <span>
        { price } €
      </span>
    );
  },
});

module.exports = Price;
