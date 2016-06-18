var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var RouteHandler = require('react-router').RouteHandler;
var connectToStores = require('alt/utils/connectToStores');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var ButtonLink = ReactRouterBootstrap.ButtonLink;

function getArrivedDeliveries() {
  return connectToStores(React.createClass({
    propTypes: {
    },

    statics: {
      getStores() {
        return [  ];
      },

      getPropsFromStores() {
        return {

        };
      },
    },

    componentWillMount() {
    },

    render() {
      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Saapuvat tilaukset
            </h1>
          </Col>
        </Row>
      );
    },
  }));
}

module.exports = getArrivedDeliveries;
