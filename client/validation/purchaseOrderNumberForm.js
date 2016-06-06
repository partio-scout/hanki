var validator = require('validator');
var getModelValidator = require('./modelValidator');

var notEmpty = function(string) {
  return !validator.isNull(string);
};
var schema = [
  {
    property: 'finalPrice',
    test: notEmpty,
    message: 'Syötä lopullinen hinta',
  },
];

module.exports = getModelValidator(schema);
