var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var RouteHandler = require('react-router').RouteHandler;
var connectToStores = require('alt/utils/connectToStores');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var ButtonLink = ReactRouterBootstrap.ButtonLink;

var Reactable = require('reactable');
var Table = Reactable.Table;
var Tr = Reactable.Tr;
var Td = Reactable.Td;

var Price = require('./utils/Price');

// function getExternalOrderEditButton(externalOrder) {
//   return (
//     <ButtonLink
//       bsStyle="link"
//       className="edit"
//       to="edit_external_order"
//       params={ { externalorderId: externalOrder.externalorderId } }
//       disabled={ externalOrder.ordered }>
//       <Glyphicon glyph="pencil" />
//     </ButtonLink>
//   );
// }

// function getExternalOrderDeleteButton(externalOrder) {
//   return (
//     <ButtonLink
//       bsStyle="link"
//       className="delete"
//       to="delete_external_order"
//       params={ { externalorderId: externalOrder.externalorderId } }
//       disabled={ externalOrder.ordered || externalOrder.order_rows.length !== 0 }>
//       <Glyphicon glyph="remove" />
//     </ButtonLink>
//   );
// }

function getExternalOrders(ExternalOrderStore, PurchaseOrderStore, ExternalOrderList) {
  return connectToStores(React.createClass({
    propTypes: {
      externalOrders: React.PropTypes.object,
      orderrows: React.PropTypes.object,
    },

    statics: {
      getStores() {
        return [ ExternalOrderStore, PurchaseOrderStore ];
      },

      getPropsFromStores() {
        return {
          externalOrders: ExternalOrderStore.getState().externalOrders,
          orderrows: PurchaseOrderStore.getState().purchaseOrderRows,
        };
      },
    },

    render() {
      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Ulkoiset tilaukset
            </h1>
            <div className="toolBar">
              <ButtonLink to="new_external_order" bsStyle="primary">
                <Glyphicon glyph="plus" />
                <span> Uusi ulkoinen tilaus</span>
              </ButtonLink>
            </div>
            <ExternalOrderList
              ExternalOrders={ this.props.externalOrders }
              orderRows={ this.props.orderrows }
              readOnly={ this.props.readOnly }
            />
          </Col>
        </Row>
      );
    },
  }));
}

module.exports = getExternalOrders;
