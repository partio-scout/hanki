var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var Grid = ReactBootstrap.Grid;

var Router = require('react-router');

function getApp(UserStore, UserActions) {
  return React.createClass({
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

    render() {
      var nameItem = '';
      if(this.state.currentUser) {
        nameItem = (
          <NavItem>
            { this.state.currentUser.email }
          </NavItem>
        );
      }

      return (
        <div>
          <Navbar brand='HANKI'>
            <Nav right>
              { nameItem }
            </Nav>
          </Navbar>
          <Grid>
            <Router.RouteHandler />
          </Grid>
        </div>
      );
    }
  });
}

module.exports = getApp;
