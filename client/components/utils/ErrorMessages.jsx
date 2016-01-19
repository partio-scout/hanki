var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Alert = ReactBootstrap.Alert;

var ErrorMessages = React.createClass({
  propTypes: {
    messages: React.PropTypes.arrayOf(React.PropTypes.string),
  },

  getDefaultProps: function() {
    return {
      messages: [ ],
    };
  },

  render: function() {
    if (this.props.messages.length === 0) {
      return null;
    }
    return (
      <Alert bsStyle="danger">
        <ul>
          {
            _.map(this.props.messages, message => <li>{ message }</li>)
          }
        </ul>
      </Alert>
    );
  },
});

module.exports = ErrorMessages;
