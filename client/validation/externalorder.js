var validator = require('validator');
var getModelValidator = require('./modelValidator');

var isNonEmptyString = function(value) {
  return validator.isLength(value, 1);
};

var isPosititiveOrZeroIntOrEmpty = function(value) {
  return validator.isInt(value, { min: 0 }) || validator.isNull(value);
};

var schema = [
  {
    property: 'supplierName',
    test: isNonEmptyString,
    message: 'Syötä toimittajan nimi',
  },
  {
    property: 'businessId',
    test: isNonEmptyString,
    message: 'Syötä toimittajan y-tunnus',
  },
  {
    property: 'externalorderId',
    test: isPosititiveOrZeroIntOrEmpty,
    message: 'Tilausnumeron on oltava',
  },
];

module.exports = getModelValidator(schema);
