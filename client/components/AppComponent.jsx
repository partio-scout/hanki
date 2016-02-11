var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var NavItemLink = ReactRouterBootstrap.NavItemLink;
var Grid = ReactBootstrap.Grid;

var Router = require('react-router');

function getApp(ErrorNotification, SessionTimeoutNotification, restrictToRoles, UserStore, UserActions) {
  var AdminNavItemLink = restrictToRoles(['procurementAdmin', 'procurementMaster'], NavItemLink);
  var OrdererNavItemLink = restrictToRoles(['orderer'], NavItemLink);

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
      var ordersItem = '';
      var titlesLink = '';
      var myOrdersItem = '';
      var nameItem = '';
      var logoutItem = '';
      if (this.state.currentUser) {
        ordersItem = (
          <AdminNavItemLink to="all_purchase_orders">
            Tilaukset
          </AdminNavItemLink>
        );
        titlesLink = (
          <AdminNavItemLink to="title_list">
            Tuotteet
          </AdminNavItemLink>
        );
        myOrdersItem = (
          <OrdererNavItemLink to="my_purchase_orders">
            Omat tilaukset
          </OrdererNavItemLink>
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
              { myOrdersItem }
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
