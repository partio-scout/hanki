var validator = require('validator');
var getModelValidator = require('./modelValidator');

var isNonEmptyString = function(value) {
  return validator.isLength(value, 1);
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
];

module.exports = getModelValidator(schema);
