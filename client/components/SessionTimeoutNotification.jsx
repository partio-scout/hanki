var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

var getSessionTimeoutNotification = function(accessToken) {
  return React.createClass({
    getInitialState: function() {
      return { sessionExpired: false };
    },

    setSessionExpiryTimeout: function() {
      var ttlInMilliseconds = accessToken.ttl * 1000;
      var tokenExpires = (new Date(accessToken.created).getTime()) + ttlInMilliseconds;
      var millisecondsLeft = tokenExpires - Date.now();

      // If the access token has already expired, we're already shown the login page
      // so there's no need to display this notification
      if (millisecondsLeft > 0) {
        this.timeout = setTimeout(() => this.setState({ sessionExpired: true }), millisecondsLeft);
      }
    },

    componentDidMount: function() {
      if (accessToken) {
        this.setSessionExpiryTimeout();
      }
    },

    componentWillUnmount: function() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    },

    render: function() {
      return (
        <Modal show={ this.state.sessionExpired } onHide={ _.noop }>
          <Modal.Header>
            <Modal.Title>Istuntosi on vanhentunut</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Ole hyvä ja kirjaudu sisään uudelleen.
          </Modal.Body>
          <Modal.Footer>
            <div className="text-center">
              <Button href="/saml/login" bsStyle="primary">Kirjaudu sisään</Button>
              <Button href="/">Peruuta</Button>
            </div>
          </Modal.Footer>
        </Modal>
      );
    },
  });
};

module.exports = getSessionTimeoutNotification;
