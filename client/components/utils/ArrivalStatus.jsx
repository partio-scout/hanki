var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;

var ArrivalStatus = React.createClass({
  propTypes: {
    row: React.PropTypes.object,
    onMarkDelivered: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      row: {},
    };
  },

  onClick() {
    this.props.onMarkDelivered(this.props.row.orderRowId || 0);
  },

  render: function() {
    var arrivalStatus = 'Ei';
    if (this.props.row) {
      if (this.props.row.arrivedStatus === 'PARTLY') {
        arrivalStatus = 'Osittain';
      } else if (this.props.row.arrivedStatus === 'ARRIVED') {
        arrivalStatus = 'Saapunut';
      }

      if (this.props.row.deliveryId === 1 && !this.props.row.delivered) {
        arrivalStatus = (
          <Button bsStyle="link" className="add" onClick={ this.onClick }> <Glyphicon glyph="ok" /> </Button>
        );
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
