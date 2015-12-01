var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var RouteHandler = require('react-router').RouteHandler;
var connectToStores = require('alt/utils/connectToStores');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Table = ReactBootstrap.Table;
var Panel = ReactBootstrap.Panel;
var Glyphicon = ReactBootstrap.Glyphicon;
var ButtonLink = ReactRouterBootstrap.ButtonLink;

function getTitleEditButton(title) {
  return title.titleId !== 0 && (
    <ButtonLink bsStyle="link" className="edit" to="edit_title" params={ { titleId: title.titleId } }>
      <Glyphicon glyph="pencil" />
    </ButtonLink>
  );
}

function getTitleDeleteButton(title) {
  return title.titleId !== 0 && title.order_rows.length === 0 && (
    <ButtonLink bsStyle="link" className="delete" to="delete_title" params={ { titleId: title.titleId } }>
      <Glyphicon glyph="remove" />
    </ButtonLink>
  );
}

function getTitleList(TitleStore) {
  return connectToStores(React.createClass({
    propTypes: {
      titles: React.PropTypes.object,
      titleGroups: React.PropTypes.object,
    },

    statics: {
      getStores() {
        return [ TitleStore ];
      },

      getPropsFromStores() {
        return {
          titles: TitleStore.getState().titles,
          titleGroups: _.filter(TitleStore.getState().titleGroups, titlegroup => titlegroup.titlegroupId !== 0),
        };
      },
    },

    render() {
      var titlesByGroup = _.groupBy(this.props.titles, 'titlegroupId');

      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Tuotteet
            </h1>
            {
              _.map(this.props.titleGroups, titleGroup =>
                <Panel>
                  <h2>{ titleGroup.name }</h2>
                  <Table striped>
                    <thead>
                      <tr><th>Nimi</th><th>Tilauksien määrä</th></tr>
                    </thead>
                    <tbody>
                      {
                        _.map(titlesByGroup[titleGroup.titlegroupId], title =>
                          <tr>
                            <td>
                              { getTitleEditButton(title) }
                              { getTitleDeleteButton(title) }
                              { title.name }
                            </td>
                            <td>
                              { title.order_rows.length }
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </Table>
                </Panel>
              )
            }
          </Col>
        </Row>
      );
    },
  }));
}

module.exports = getTitleList;
