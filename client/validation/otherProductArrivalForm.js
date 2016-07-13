var validator = require('validator');
var getModelValidator = require('./modelValidator');

var isDate = function(value) {
  return validator.isDate(value);
};

var isPosititiveOrZeroInt = function(value) {
  return validator.isInt(value, { min: 0 });
};

var schema = [
  {
    property: 'arrivalDate',
    test: isDate,
    message: 'Syötä saapumispäivämäärä',
  },
  {
    property: 'amount',
    test: isPosititiveOrZeroInt,
    message: 'Syötä saapuneiden tuotteiden määrä',
  },
];

module.exports = getModelValidator(schema);
