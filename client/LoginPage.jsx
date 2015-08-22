var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Button = ReactBootstrap.Button;

var LoginPage = React.createClass({
  render: function () {
    return (
      <Row>
        <Col>
          <h3>TERVETULOA!!!</h3>
          <p>Lorem ipsum dolor sit amet</p>
          <ButtonToolbar>
            <Button
              href="/samllogin"
              bsStyle='primary'
              bsSize='large'>
              Kirjaudu sisään Partio ID:llä
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    );
  }
});

module.exports = LoginPage;
