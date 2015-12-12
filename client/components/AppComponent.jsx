var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var Grid = ReactBootstrap.Grid;

var Router = require('react-router');

function getApp(ErrorNotification, UserStore, UserActions) {
  return React.createClass({
    mixins: [ Router.Navigation ],

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
      if (!state.currentUser) {
        this.transitionTo('home');
      }
      this.setState(state);
    },

    onLogoutClick() {
      UserActions.logoutCurrentUser();
    },

    render() {
      var nameItem = '';
      var logoutItem = '';
      if (this.state.currentUser) {
        nameItem = (
          <NavItem>
            { this.state.currentUser.email }
          </NavItem>
        );
        logoutItem = (
          <NavItem onClick={ this.onLogoutClick }>
            Kirjaudu ulos
          </NavItem>
        );
      }

      return (
        <div>
          <ErrorNotification />
          <Navbar brand="HANKI">
            <Nav right>
              { nameItem }
              { logoutItem }
            </Nav>
          </Navbar>
          <Grid>
            <Router.RouteHandler />
          </Grid>
        </div>
      );
    },
  });
}

module.exports = getApp;
