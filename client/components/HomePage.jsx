var React = require('react');

var Router = require('react-router');
var Navigation = Router.Navigation;

var ReactBootstrap = require('react-bootstrap');
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Button = ReactBootstrap.Button;
var Alert = ReactBootstrap.Alert;

function getHomePage(UserStore, UserActions) {
  return React.createClass({
    mixins: [ Navigation ],

    getInitialState() {
      return UserStore.getState();
    },

    componentDidMount() {
      UserStore.listen(this.onChange);
    },

    componentWillUnmount() {
      UserStore.unlisten(this.onChange);
    },

    onChange(state) {
      this.setState(state);
    },

    render: function () {
      var homeView;
      if (this.state.currentUser === undefined) {
        homeView = 'Loading...';
      } else if (this.state.currentUser === null) {
        homeView = (
          <div>
            <p>
              <Button
                href="/saml/login"
                bsStyle='primary'
                bsSize='large'>
                Kirjaudu sisään Partio ID:llä
              </Button>
            </p>
            <Alert bsSize="medium" bsStyle="info">Kirjautumalla hyväksyn henkilötietojeni luovutuksen käsiteltäväksi Euroopan Talousalueen ulkopuolelle.</Alert>
          </div>
        );
      } else {
        // Redirect logged in users to My Purchase Orders page
        this.replaceWith('my_purchase_orders');
        homeView = '';
      }

      return (
        <Row>
          <Col>
            <div className="text-center">
              <h1>Tervetuloa Hankiin!</h1>
              <p>...ja eikun hankkimaan!</p>
              { homeView }
            </div>
          </Col>
        </Row>
      );
    }

  });
};

module.exports = getHomePage;
