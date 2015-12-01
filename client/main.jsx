require('./styles.scss');

// Get REST API access token

var Cookie = require('js-cookie');
var accessToken = Cookie.getJSON('accessToken');
var deleteAccessToken = function() {
  Cookie.remove('accessToken');
};

// Setup REST resources

var userId = accessToken && accessToken.userId || 0;

var request = require('superagent');
var RestfulResource = require('./utils/rest')(request);
var User = new RestfulResource('/api/Purchaseusers', accessToken);
var PurchaseOrder = new RestfulResource('/api/Purchaseorders', accessToken);
var MyPurchaseOrder = new RestfulResource('/api/Purchaseusers/' + userId + '/orders', accessToken);
var PurchaseOrderRow = new RestfulResource('/api/Purchaseorderrows', accessToken);
var CostCenter = new RestfulResource('/api/Purchaseusers/' + userId + '/costcenters', accessToken);
var Title = new RestfulResource('/api/Titles', accessToken);
var Titlegroup = new RestfulResource('/api/Titlegroups', accessToken);
var Delivery = new RestfulResource('/api/Deliveries', accessToken);

// Set up Flux

var Alt = require('alt');
var alt = new Alt();

var UserActions = require('./actions/UserActions')(alt, User, deleteAccessToken);
var UserStore = require('./stores/UserStore')(alt, UserActions);

var PurchaseOrderActions = require('./actions/PurchaseOrderActions')(alt, PurchaseOrder, PurchaseOrderRow, MyPurchaseOrder);
var PurchaseOrderStore = require('./stores/PurchaseOrderStore')(alt, PurchaseOrderActions);

var CostCenterActions = require('./actions/CostCenterActions')(alt, CostCenter);
var CostCenterStore = require('./stores/CostCenterStore')(alt, CostCenterActions);

var DeliveryActions = require('./actions/DeliveryActions')(alt, Delivery);
var DeliveryStore = require('./stores/DeliveryStore')(alt, DeliveryActions);

var TitleActions = require('./actions/TitleActions')(alt, Title, Titlegroup);
var TitleStore = require('./stores/TitleStore')(alt, TitleActions);

var ErrorActions = require('./actions/ErrorActions')(alt);
var ErrorStore = require('./stores/ErrorStore')(alt, ErrorActions, PurchaseOrderActions, DeliveryActions, CostCenterActions, TitleActions);

// Setup main views

var ErrorNotification = require('./components/ErrorNotification')(ErrorActions, ErrorStore);
var App = require('./components/AppComponent')(ErrorNotification, UserStore, UserActions);
var HomePage = require('./components/HomePage')(UserStore, UserActions);

var MyPurchaseOrders = require('./components/MyPurchaseOrders')(PurchaseOrderActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore);
var NewPurchaseOrder = require('./components/NewPurchaseOrder')(PurchaseOrderActions, CostCenterStore);
var EditPurchaseOrder = require('./components/EditPurchaseOrder')(PurchaseOrderActions, CostCenterStore, PurchaseOrderStore);
var DeletePurchaseOrder = require('./components/DeletePurchaseOrder')(PurchaseOrderActions, PurchaseOrderStore);

var NewPurchaseOrderRow = require('./components/NewPurchaseOrderRow')(PurchaseOrderActions, PurchaseOrderStore, TitleStore, DeliveryStore);
var EditPurchaseOrderRow = require('./components/EditPurchaseOrderRow')(PurchaseOrderActions, PurchaseOrderStore, TitleStore, DeliveryStore);
var DeletePurchaseOrderRow = require('./components/DeletePurchaseOrderRow')(PurchaseOrderActions, PurchaseOrderStore, TitleStore);

// Setup routes

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var routes = (
  <Route handler={ App } path="/">
    <DefaultRoute name="home" handler={ HomePage } />
    <Route name="my_purchase_orders" path="own" handler={ MyPurchaseOrders }>
      <Route name="new_purchase_order" path="new" handler={ NewPurchaseOrder } />
      <Route name="edit_purchase_order" path=":purchaseOrder/edit" handler={ EditPurchaseOrder } />
      <Route name="delete_purchase_order" path=":purchaseOrder/delete" handler={ DeletePurchaseOrder } />
      <Route name="new_purchase_order_row" path=":purchaseOrder/new" handler={ NewPurchaseOrderRow } />
      <Route name="edit_purchase_order_row" path="rows/:purchaseOrderRow/edit" handler={ EditPurchaseOrderRow } />
      <Route name="delete_purchase_order_row" path="rows/:purchaseOrderRow/delete" handler={ DeletePurchaseOrderRow } />
    </Route>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

// Check if current user seems to be logged in and start loading content

if (accessToken && accessToken.userId) {
  UserActions.fetchCurrentUser(accessToken.userId);
  PurchaseOrderActions.fetchMyPurchaseOrders(accessToken.userId);
  CostCenterActions.fetchCostCenters();
  TitleActions.fetchTitles();
  DeliveryActions.fetchDeliveries();
} else {
  UserActions.fetchCurrentUser();
}
