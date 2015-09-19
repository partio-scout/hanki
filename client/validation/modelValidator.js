var _ = require('lodash');

var validator = function(schema) {
  return function(model) {
    var errors = _(schema).map((rule) => {
      var prop = model[rule.property];
      if(!rule.test(prop)) {
        return rule.message;
      } else {
        return null;
      }
    }).pick(_.identity).toArray().value(); // remove null values
    return errors;
  }
};

module.exports = validator;
