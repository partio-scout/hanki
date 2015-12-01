var validator = require('validator');
var getModelValidator = require('./modelValidator');

var isPosititiveOrZeroInt = function(value) {
  return validator.isInt(value, { min: 0 });
};

var isNonEmptyString = function(value) {
  return validator.isLength(value, 1);
};

var isUndefinedOrNonEmptyString = function(value) {
  return value === undefined || value === null || validator.isLength(value, 1);
};

var schema = [
  {
    property: 'titlegroupId',
    test: isPosititiveOrZeroInt,
    message: 'Valitse tuoteryhmä',
  },
  {
    property: 'name',
    test: isNonEmptyString,
    message: 'Syötä nimi',
  },
  {
    property: 'unit',
    test: isUndefinedOrNonEmptyString,
    message: 'Syötä yksikkö',
  },
];

module.exports = getModelValidator(schema);
