var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var Grid = ReactBootstrap.Grid;

var Router = require('react-router');

function getApp(ErrorNotification, SessionTimeoutNotification, restrictToRoles, UserStore, UserActions) {
  var AdminNavItem = restrictToRoles(['procurementAdmin', 'procurementMaster'], NavItem);

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

    navigateToTitles() {
      this.transitionTo('title_list');
    },

    navigateToOrders() {
      this.transitionTo('all_purchase_orders');
    },

    render() {
      var ordersItem = '';
      var titlesLink = '';
      var nameItem = '';
      var logoutItem = '';
      if (this.state.currentUser) {
        ordersItem = (
          <AdminNavItem onClick={ this.navigateToOrders }>
            Tilaukset
          </AdminNavItem>
        );
        titlesLink = (
          <AdminNavItem onClick={ this.navigateToTitles }>
            Tuotteet
          </AdminNavItem>
        );
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
          <SessionTimeoutNotification />
          <ErrorNotification />
          <Navbar brand="HANKI">
            <Nav right>
              { ordersItem }
              { titlesLink }
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
