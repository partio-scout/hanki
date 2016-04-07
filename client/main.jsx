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
var CostCenter = new RestfulResource('/api/Costcenters/', accessToken);
var OwnCostCenter = new RestfulResource('/api/Purchaseusers/' + userId + '/costcenters', accessToken);
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

var CostCenterActions = require('./actions/CostCenterActions')(alt, OwnCostCenter, CostCenter);
var CostCenterStore = require('./stores/CostCenterStore')(alt, CostCenterActions);

var DeliveryActions = require('./actions/DeliveryActions')(alt, Delivery);
var DeliveryStore = require('./stores/DeliveryStore')(alt, DeliveryActions);

var TitleActions = require('./actions/TitleActions')(alt, Title, Titlegroup);
var TitleStore = require('./stores/TitleStore')(alt, TitleActions);

var ErrorActions = require('./actions/ErrorActions')(alt);
var ErrorStore = require('./stores/ErrorStore')(alt, ErrorActions, PurchaseOrderActions, DeliveryActions, CostCenterActions, TitleActions);

// Setup main views

var ErrorNotification = require('./components/ErrorNotification')(ErrorActions, ErrorStore);
var SessionTimeoutNotification = require('./components/SessionTimeoutNotification')(accessToken);
var restrictToRoles = require('./components/utils/restrictToRoles')(UserStore);
var App = require('./components/AppComponent')(ErrorNotification, SessionTimeoutNotification, restrictToRoles, UserStore, UserActions);
var HomePage = require('./components/HomePage')(UserStore, UserActions);

var MyPurchaseOrders = require('./components/MyPurchaseOrders')(PurchaseOrderActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore);
var NewPurchaseOrder = require('./components/NewPurchaseOrder')(PurchaseOrderActions, CostCenterStore);
var EditPurchaseOrder = require('./components/EditPurchaseOrder')(PurchaseOrderActions, CostCenterStore, PurchaseOrderStore);
var DeletePurchaseOrder = require('./components/DeletePurchaseOrder')(PurchaseOrderActions, PurchaseOrderStore);

var NewPurchaseOrderRow = require('./components/NewPurchaseOrderRow')(PurchaseOrderActions, PurchaseOrderStore, TitleStore, DeliveryStore);
var EditPurchaseOrderRow = require('./components/EditPurchaseOrderRow')(PurchaseOrderActions, PurchaseOrderStore, TitleStore, DeliveryStore);
var DeletePurchaseOrderRow = require('./components/DeletePurchaseOrderRow')(PurchaseOrderActions, PurchaseOrderStore, TitleStore);

var TitleList = restrictToRoles(['procurementAdmin', 'procurementMaster'], require('./components/TitleList')(TitleStore));
var NewTitle = restrictToRoles(['procurementAdmin', 'procurementMaster'], require('./components/NewTitle')(TitleActions, TitleStore));
var EditTitle = restrictToRoles(['procurementAdmin', 'procurementMaster'], require('./components/EditTitle')(TitleActions, TitleStore));
var DeleteTitle = restrictToRoles(['procurementAdmin', 'procurementMaster'], require('./components/DeleteTitle')(TitleActions, TitleStore));

var AllPurchaseOrders = restrictToRoles(['procurementAdmin', 'procurementMaster'], require('./components/AllPurchaseOrders')(accessToken, PurchaseOrderActions, CostCenterActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore));

var CostcenterPurchaseOrders = require('./components/CostcenterPurchaseOrders')(PurchaseOrderActions, CostCenterActions, PurchaseOrderStore, CostCenterStore, TitleStore, DeliveryStore);

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
    <Route name="title_list" path="titles" handler={ TitleList }>
      <Route name="new_title" path="new" handler={ NewTitle } />
      <Route name="edit_title" path=":titleId/edit" handler={ EditTitle } />
      <Route name="delete_title" path=":titleId/delete" handler={ DeleteTitle } />
    </Route>
    <Route name="all_purchase_orders" path="allOrders" handler={ AllPurchaseOrders }>
      <Route name="all_purchase_orders_create_row" path=":purchaseOrder/new" handler={ NewPurchaseOrderRow } />
      <Route name="all_purchase_orders_edit_row" path=":purchaseOrderRow/edit" handler={ EditPurchaseOrderRow } />
      <Route name="all_purchase_orders_delete_row" path=":purchaseOrderRow/delete" handler={ DeletePurchaseOrderRow } />
    </Route>
    <Route name="costcenter_purchase_orders" path="costCenterPurchaseOrders" handler={ CostcenterPurchaseOrders } />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

// Check if current user seems to be logged in and start loading content

var accessTokenValid = false;
if (accessToken) {
  var accessTokenCreated = new Date(accessToken.created);
  var elapsedSeconds = (Date.now() - accessTokenCreated) / 1000;
  accessTokenValid = accessToken.ttl > elapsedSeconds;
}

if (accessToken && accessToken.userId && accessTokenValid) {
  UserActions.fetchCurrentUser(accessToken.userId);
  PurchaseOrderActions.fetchMyPurchaseOrders(accessToken.userId);
  CostCenterActions.fetchOwnCostCenters();
  TitleActions.fetchTitles();
  DeliveryActions.fetchDeliveries();
} else {
  deleteAccessToken();
  UserActions.fetchCurrentUser();
}
