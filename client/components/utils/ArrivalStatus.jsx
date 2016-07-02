var React = require('react');

var ArrivalStatus = React.createClass({
  propTypes: {
    row: React.PropTypes.object,
  },

  getDefaultProps: function() {
    return {
      row: {},
    };
  },

  render: function() {
    var arrivalStatus = 'Ei';
    if (this.props.row) {
      if (this.props.row.arrivedStatus === 'PARTLY') {
        arrivalStatus = 'Osittain';
      } else if (this.props.row.arrivedStatus === 'ARRIVED') {
        arrivalStatus = 'Saapunut';
      }
    }

    return (
      <span>
        { arrivalStatus }
      </span>
    );
  },
});

module.exports = ArrivalStatus;
