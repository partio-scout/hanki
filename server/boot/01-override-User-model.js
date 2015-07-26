// from https://gist.github.com/pulkitsinghal/43d4bae2467c686ec55b

module.exports = function(app) {
  var User = app.models.User;

  // add new "properties" to the built-in User mode via boot script

  User.defineProperty('phone', { type: 'string' });
  User.defineProperty('enlistment', { type: 'string' });
  User.defineProperty('user_section', { type: 'string' });

  // (2) This is how you can add a "relationship" to the built-in User model via boot script
  var Purchaseorder = app.models.Purchaseorder;
  User.hasMany(Purchaseorder, {as: 'Purchaseorders', foreignKey: 'subscriber'});

  var Usageobject = app.models.Usageobject;
  User.hasMany(Usageobject, {as: 'Usagebjects', foreignKey: 'master'});
  User.hasMany(Usageobject, {as: 'Usagebjects', foreignKey: 'controller'});
  User.hasMany(Usageobject, {as: 'Usagebjects', foreignKey: 'provider'});

  // (3) This is how you can add "remote methods" to the built-in User model via boot script
  // (3a) either
  /*
  User.greet = function(msg, cb) {
    cb(null, 'Greetings... ' + msg);
  }
  */

  // (3a) or
  /*
  User.remoteMethod(
    'greet',
    {
      accepts: {arg: 'msg', type: 'string'},
      returns: {arg: 'greeting', type: 'string'}
    }
  );
  */

  // (4) This is a low-level/dynamic way to add "remoting" for any of the built-in models via boot script
  //     reference: https://groups.google.com/forum/#!topic/loopbackjs/0yHzU7PR19U
  //     *** UN-TESTED BY THE ORIGINAL AUTHOR OF THIS GIST ***
  /*var remotes = app.remotes();
  remotes.after('**', function(ctx, next, method) {
    var req = ctx.req;
    var Model = method.ctor;
    var modelInstance = ctx.instance;
    if (Model.modelName === 'MyModel') {
      // ...
    }
    next();
  });*/

  // (5) This is how you can add "hooks" to the built-in User model via boot script
  /*
  User.beforeCreate = function(next, modelInstance) {
    console.log('inside User.beforeCreate');
    // your code goes here
    next();
  };
  */

  // (6) This is how you can add "event observers" to the built-in User model via boot script
  /*
  User.on('resetPasswordRequest', function (info) {
    console.log('inside User.on.resetPasswordRequest');
    // your code goes here
  });
  */

};