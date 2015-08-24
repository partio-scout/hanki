var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Button = ReactBootstrap.Button;
var Alert = ReactBootstrap.Alert;

// Yes, this is ugly - will fix later
var Cookie = require('js-cookie');
var accessToken = Cookie.getJSON('accessToken');
var email = Cookie.getJSON('email');

var LoginPage = React.createClass({
  render: function () {
    var homeView;
    if (accessToken) {
      homeView = (
        <Alert bsStyle="success">
          Tervetuloa, { email }
        </Alert>
      );
    } else {
      homeView = (
        <ButtonToolbar>
          <Button
            href="/saml/login"
            bsStyle='primary'
            bsSize='large'>
            Kirjaudu sisään Partio ID:llä
          </Button>
        </ButtonToolbar>
      );
    }

    return (
      <Row>
        <Col>
          <h3>HANKI</h3>
          <p>Lorem ipsum dolor sit amet</p>
          { homeView }
        </Col>
      </Row>
    );
  }
});

module.exports = LoginPage;
