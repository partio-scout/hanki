var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;

function getAcceptanceStatus(editRoles, restrictToRoles) {
  var Restricted = restrictToRoles(editRoles, 'div');

  var AcceptanceStatus = React.createClass({
    propTypes: {
      status: React.PropTypes.oneOfType([ React.PropTypes.bool, React.PropTypes.object ]),
      onChange: React.PropTypes.func,
      onReset: React.PropTypes.func,
      isSelectedCallback: React.PropTypes.func,
      orderRowId: React.PropTypes.number,
      type: React.PropTypes.string,
    },

    onChange: function() {
      this.props.onChange && this.props.onChange(this.props.orderRowId, this.props.type, !this.isChecked());
    },

    isChecked: function() {
      return this.props.isSelectedCallback(this.props.type, this.props.orderRowId);
    },

    reset: function() {
      this.props.onReset && this.props.onReset(this.props.type, this.props.orderRowId);
    },

    render: function() {
      if (this.props.status === true) {
        return (
          <div>
            <Glyphicon glyph="ok" className="accepted" />
            <Restricted>
              <Button onClick={ this.reset } bsStyle="link" className="reset">nollaa</Button>
            </Restricted>
          </div>
        );
      } else if (this.props.status === false) {
        return (
          <div>
            <Glyphicon glyph="remove" className="declined" />
            <Restricted>
              <Button onClick={ this.reset } bsStyle="link" className="reset">nollaa</Button>
            </Restricted>
          </div>
        );
      } else {
        return (
          <Restricted>
            <Input
              type="checkbox"
              onChange={ this.onChange }
              checked={ this.isChecked() }
            />
          </Restricted>
        );
      }
    },
  });

  return AcceptanceStatus;
}

module.exports = getAcceptanceStatus;
