var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var ButtonLink = ReactRouterBootstrap.ButtonLink;
var Glyphicon = ReactBootstrap.Glyphicon;

var ArrivalStatus = React.createClass({
  propTypes: {
    row: React.PropTypes.object,
    to: React.PropTypes.string,
    disabled: React.PropTypes.bool,
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

      if (this.props.row.deliveryId === 1) {
        arrivalStatus = (
          <span><ButtonLink bsStyle="link" className="arrival-button" to={ this.props.to } disabled={ this.props.disabled } params={ { rowId: this.props.row.orderRowId } }><Glyphicon glyph="pencil" /> </ButtonLink> { arrivalStatus } </span>
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
