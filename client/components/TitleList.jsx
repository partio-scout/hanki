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

function getTitleEditButton(title) {
  return (
    <ButtonLink
      bsStyle="link"
      className="edit"
      to="edit_title"
      params={ { titleId: title.titleId } }
      disabled={ title.titleId === 0 }>
      <Glyphicon glyph="pencil" />
    </ButtonLink>
  );
}

function getTitleDeleteButton(title) {
  return (
    <ButtonLink
      bsStyle="link"
      className="delete"
      to="delete_title"
      params={ { titleId: title.titleId } }
      disabled={ title.titleId === 0 || title.order_rows.length !== 0 }>
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
          titleGroups: TitleStore.getState().titleGroups,
          titles: _.sortBy(TitleStore.getState().titles, title => -title.titleId),
        };
      },
    },

    render() {
      return (
        <Row>
          <Col>
            <RouteHandler />
            <h1>
              Tuotteet
            </h1>
            <div className="toolBar">
              <ButtonLink to="new_title" bsStyle="primary">
                <Glyphicon glyph="plus" />
                <span> Uusi tuote</span>
              </ButtonLink>
            </div>
            {
              <Table className="table table-striped" itemsPerPage={ 60 } sortable={ true }
                filterable={ [ 'Tuoteryhmä', 'Nimi' ] } filterPlaceholder="Etsi tuotteita">
                {
                  _(this.props.titles)
                    .filter(title => title.titleId !== 0)
                    .map(title => {
                      var titlegroup = this.props.titleGroups[title.titlegroupId] || {};
                      return (
                        <Tr>
                            <Td column="Tuoteryhmä">
                              { titlegroup.name || '?' }
                            </Td>
                            <Td column="Nimi" value={ title.name }>
                              <span>
                                { getTitleEditButton(title) }
                                { getTitleDeleteButton(title) }
                                { title.name }
                              </span>
                            </Td>
                            <Td column="Hinta" value={ title.priceWithTax }>
                              <Price value={ title.priceWithTax } />
                            </Td>
                            <Td column="Tilausrivien määrä">
                              { title.order_rows.length }
                            </Td>
                        </Tr>
                      );
                    }).value()
                }
              </Table>
            }
          </Col>
        </Row>
      );
    },
  }));
}

module.exports = getTitleList;
