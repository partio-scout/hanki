var validator = require('validator');
var getModelValidator = require('./modelValidator');

var isPositiveInt = function(value) {
  return validator.isInt(value, { min: 1 });
};

var isDate = function(value) {
  return validator.isDate(value);
};

var schema = [
  {
    property: 'externalorderId',
    test: isPositiveInt,
    message: 'Saapuneen tilauksen täytyy liittyä ulkoiseen tilaukseen.',
  },
  {
    property: 'arrivalDate',
    test: isDate,
    message: 'Valitse saapumispäivä',
  },
];

module.exports = getModelValidator(schema);
