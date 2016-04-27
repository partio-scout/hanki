var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Glyphicon = ReactBootstrap.Glyphicon;

function getWithAcceptances(PurchaseOrderActions, restrictToRoles) {
  var ApproversOnly = restrictToRoles(['controller', 'procurementMaster', 'procurementAdmin'], 'div');
  return function withAcceptances(Elem) {
    var AcceptanceContainer = React.createClass({
      propTypes: {
        purchaseOrderRows: React.PropTypes.object,
      },

      getInitialState: function() {
        return {
          'controller': [],
          'procurement': [],
        };
      },

      clearSelections: function() {
        this.setState({
          'controller': [],
          'procurement': [],
        });
      },

      rowSelectionChanged: function(orderRowId, type, isChecked) {
        var stateChange = { };
        if (isChecked) {
          stateChange[type] = this.state[type].concat([ orderRowId ]);
        } else {
          stateChange[type] = _(this.state[type]).without(orderRowId).value();
        }
        this.setState(stateChange);
      },

      isSelected: function(type, id) {
        return this.state[type].indexOf(id) >= 0;
      },

      areRowsSelected: function() {
        return this.areRowsSelectedAs('controller') || this.areRowsSelectedAs('procurement');
      },

      areRowsSelectedAs: function(type) {
        return this.state[type] && this.state[type].length > 0;
      },

      selectAllRowsAs: function(type) {
        //TODO Harmonize the data model/terminology in the actions or backend, this is awful
        var acceptanceFields = {
          controller: 'controllerApproval',
          procurement: 'providerApproval',
        };
        var acceptanceField = acceptanceFields[type];

        var all = _(this.props.purchaseOrderRows)
          .filter((row) => _.isNull(row[acceptanceField]))
          .map(row => row.orderRowId)
          .value();

        // If all rows were already selected, select none
        if (this.state[type].length === all.length) {
          all = [];
        }

        var stateChange = { };
        stateChange[type] = all;
        this.setState(stateChange);
      },

      acceptRows: function() {
        if (this.areRowsSelectedAs('controller')) {
          PurchaseOrderActions.acceptPurchaseOrderRows('controller', this.state.controller);
        }
        if (this.areRowsSelectedAs('procurement')) {
          PurchaseOrderActions.acceptPurchaseOrderRows('procurement', this.state.procurement);
        }
        this.clearSelections();
      },

      declineRows: function() {
        if (this.areRowsSelectedAs('controller')) {
          PurchaseOrderActions.declinePurchaseOrderRows('controller', this.state.controller);
        }
        if (this.areRowsSelectedAs('procurement')) {
          PurchaseOrderActions.declinePurchaseOrderRows('procurement', this.state.procurement);
        }
        this.clearSelections();
      },

      resetRow: function(type, id) {
        PurchaseOrderActions.resetRowAcceptance(type, id);
      },

      render: function() {
        return (
          <div>
            <ApproversOnly className="toolBar pull-right">
              <Button bsStyle="success" onClick={ this.acceptRows } disabled={ !this.areRowsSelected() }>
                <Glyphicon glyph="ok" />
                <span> Hyväksy</span>
              </Button>
              <Button bsStyle="danger" className="space-left" onClick={ this.declineRows } disabled={ !this.areRowsSelected() }>
                <Glyphicon glyph="remove" />
                <span> Hylkää</span>
              </Button>
            </ApproversOnly>
            <Elem
              selectionCallback={ this.rowSelectionChanged }
              isSelectedCallback={ this.isSelected }
              selectAllCallback={ this.selectAllRowsAs }
              resetCallback={ this.resetRow }
              {...this.props}
            />
          </div>
        );
      },
    });

    return AcceptanceContainer;
  };
}

module.exports = getWithAcceptances;
