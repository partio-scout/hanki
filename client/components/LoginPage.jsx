var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Button = ReactBootstrap.Button;
var Alert = ReactBootstrap.Alert;

function getLoginPage(UserStore, UserActions) {
  return React.createClass({

    getInitialState() {
      return UserStore.getState();
    },

    componentDidMount() {
      UserStore.listen(this.onChange);
      UserActions.fetchCurrentUser();
    },

    componentWillUnmount() {
      UserStore.unlisten(this.onChange);
    },

    onChange(state) {
      this.setState(state);
    },

    render: function () {
      var homeView;
      console.log(this.state);
      if (this.state.currentUser === undefined) {
        homeView = (
          'Loading...'
        );
      } else if (this.state.currentUser === null) {
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
      } else {
        homeView = (
          <Alert>
            Moikka, { this.state.currentUser.email }!
          </Alert>
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
};

module.exports = getLoginPage;
