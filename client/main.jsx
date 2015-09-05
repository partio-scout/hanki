require('./styles.scss');

// Get REST API access token

var Cookie = require('js-cookie');
var accessToken = Cookie.getJSON('accessToken');
var deleteAccessToken = function() {
  Cookie.remove('accessToken');
};

// Setup REST resources

var request = require('superagent');
var RestfulResource = require('./utils/rest.js')(request);
var User = new RestfulResource('/api/Users', accessToken);
var PurchaseOrder = new RestfulResource('/api/Purchaseorders', accessToken);
var PurchaseOrderRow = new RestfulResource('/api/Purchaseorderrows', accessToken);
var CostCenter = new RestfulResource('/api/Costcenters', accessToken);
var Title = new RestfulResource('/api/Titles', accessToken);
var Titlegroup = new RestfulResource('/api/Titlegroups', accessToken);

// Set up Flux

var Alt = require('alt');
var alt = new Alt();

var UserActions = require('./actions/UserActions')(alt, User, deleteAccessToken);
var UserStore = require('./stores/UserStore')(alt, UserActions);

var PurchaseOrderActions = require('./actions/PurchaseOrderActions')(alt, PurchaseOrder, PurchaseOrderRow);
var PurchaseOrderStore = require('./stores/PurchaseOrderStore')(alt, PurchaseOrderActions);

var CostCenterActions = require('./actions/CostCenterActions')(alt, CostCenter);
var CostCenterStore = require('./stores/CostCenterStore')(alt, CostCenterActions);

var TitleActions = require('./actions/TitleActions')(alt, Title, Titlegroup);
var TitleStore = require('./stores/TitleStore')(alt, TitleActions);

// Setup main views

var App = require('./components/AppComponent.jsx')(UserStore, UserActions);
var HomePage = require('./components/HomePage.jsx')(UserStore, UserActions);
var MyPurchaseOrders = require('./components/MyPurchaseOrders.jsx')(PurchaseOrderStore, CostCenterStore, PurchaseOrderActions);
var NewPurchaseOrder = require('./components/NewPurchaseOrder.jsx')(PurchaseOrderActions, CostCenterStore);
var NewPurchaseOrderRow = require('./components/NewPurchaseOrderRow.jsx')(PurchaseOrderActions, PurchaseOrderStore, TitleStore);

// Setup routes

var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var routes = (
  <Route handler={ App } path="/">
    <DefaultRoute name="home" handler={ HomePage } />
    <Route name="my_purchase_orders" path="own" handler={ MyPurchaseOrders }>
      <Route name="new_purchase_order" path="new" handler={ NewPurchaseOrder } />
      <Route name="new_purchase_order_row" path=":purchaseOrder/new" handler={ NewPurchaseOrderRow } />
    </Route>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

// Check if current user is logged in

if (accessToken && accessToken.userId) {
  UserActions.fetchCurrentUser(accessToken.userId);
  PurchaseOrderActions.fetchMyPurchaseOrders(accessToken.userId);
  CostCenterActions.fetchCostCenters();
  TitleActions.fetchTitles();
} else {
  UserActions.fetchCurrentUser();
}
