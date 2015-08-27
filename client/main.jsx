require('./styles.scss');

// Get REST API access token

var Cookie = require('js-cookie');
var accessToken = Cookie.getJSON('accessToken');

// Setup REST resources

var request = require('superagent');
var RestfulResource = require('./utils/rest.js')(request);
var User = new RestfulResource('/api/User', accessToken);

// Set up Flux Actions and Stores

var alt = require('./alt');
var UserActions = require('./actions/UserActions')(alt, User);
var UserStore = require('./stores/UserStore')(alt, UserActions);

// Setup main views

var App = require('./components/AppComponent.jsx');
var LoginPage = require('./components/LoginPage.jsx')(UserStore, UserActions);
var MyPurchaseOrders = require('./components/MyPurchaseOrders.jsx');

// Setup routes

var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var routes = (
  <Route handler={ App } path="/">
    <DefaultRoute handler={ LoginPage } />
    <Route name="login" path="login" handler={ LoginPage } />
    <Route name="my_purchase_orders" path="own" handler={ MyPurchaseOrders }>
      <Route name="new_purchase_order" path="new" handler={ MyPurchaseOrders } />
    </Route>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
