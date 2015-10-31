var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var Static = ReactBootstrap.FormControls.Static;
var Button = ReactBootstrap.Button;

var ErrorDialog = React.createClass({
  render: function() {
    return (
      <Modal show="true" onHide={ this.props.onHide || _.noop }>
        <Modal.Header closeButton>
          <Modal.Title>{ this.props.title }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { this.props.error && this.props.error.message }
        </Modal.Body>
        <Modal.Footer>
          <div className="text-center">
            <Button onClick={ this.props.onHide || _.noop }>Ok</Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
});

module.exports = ErrorDialog;
