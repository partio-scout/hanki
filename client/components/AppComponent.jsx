var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Navbar = ReactBootstrap.Navbar;
var Grid = ReactBootstrap.Grid;

var Router = require('react-router');

var App = React.createClass({
  render() {
    return (
      <div>
        <Navbar brand='HANKI' />
        <Grid>
          <Router.RouteHandler />
        </Grid>
      </div>
    );
  }
});

module.exports = App;
