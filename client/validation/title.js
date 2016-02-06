var validator = require('validator');
var getModelValidator = require('./modelValidator');

var isPosititiveOrZeroInt = function(value) {
  return validator.isInt(value, { min: 0 });
};

var isNonEmptyString = function(value) {
  return validator.isLength(value, 1);
};

var schema = [
  {
    property: 'name',
    test: isNonEmptyString,
    message: 'Syötä nimi',
  },
  {
    property: 'titlegroupId',
    test: isPosititiveOrZeroInt,
    message: 'Valitse tuoteryhmä',
  },
  {
    property: 'unit',
    test: isNonEmptyString,
    message: 'Syötä yksikkö',
  },
  {
    property: 'vatPercent',
    test: isPosititiveOrZeroInt,
    message: 'Valitse ALV-prosentti',
  },
  {
    property: 'priceWithTax',
    test: isPosititiveOrZeroInt,
    message: 'Syötä hinta, joka on vähintään 0 €',
  },
];

module.exports = getModelValidator(schema);
