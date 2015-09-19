var validator = require('validator');
var getModelValidator = require('./modelValidator');

var notEmpty = function(string) {
  return !validator.isNull(string);
};

var schema = [
  {
    property: 'name',
    test: notEmpty,
    message: 'Tilauksen nimi ei saa olla tyhjä'
  },
  {
    property: 'costcenterId',
    test: notEmpty,
    message: 'Valitse kustannuspaikka'
  }
];

module.exports = getModelValidator(schema);
