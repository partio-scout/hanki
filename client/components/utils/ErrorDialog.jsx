var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

var ErrorDialog = React.createClass({
  propTypes: {
    onHide: React.PropTypes.func,
    title: React.PropTypes.string,
    error: React.PropTypes.instanceOf(Error),
  },

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
  },
});

module.exports = ErrorDialog;
