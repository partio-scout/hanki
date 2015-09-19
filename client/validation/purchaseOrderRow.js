var validator = require('validator');
var getModelValidator = require('./modelValidator');

var isPosititiveOrZeroInt = function(value) {
  return validator.isInt(value, { min: 0 });
};

var schema = [
  {
    property: 'titleId',
    test: isPosititiveOrZeroInt,
    message: 'Valitse tuote'
  },
  {
    property: 'amount',
    test: isPosititiveOrZeroInt,
    message: 'Syötä määrä kokonaislukuna'
  },
  {
    property: 'deliveryId',
    test: isPosititiveOrZeroInt,
    message: 'Valitse toimitusajankohta'
  }
];

module.exports = getModelValidator(schema);
