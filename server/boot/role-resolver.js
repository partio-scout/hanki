module.exports = function(app) {
	var Role = app.models.Role;
	var User = app.models.User;
	var RoleMapping = app.models.RoleMapping;
	
	/*
	// create roles if they don't already exist and assign default user to each role

	// create admin role
	Role.findOrCreate({
		where: {name: 'admin'}
	},
	{
		name: 'admin'
	}, function(err, role) {
		if(err) throw err;

		User.find({
			where: {username: 'admin'}
		}, function(err, user) {
			if (err) throw err;

			role.principals.create({
				principalType: RoleMapping.USER,
				principalId: user.id
			}, function(err, principal) {
				if(err) throw err;
			});
		});
	});

	// create orderer role
	Role.findOrCreate({
		where: {name: 'orderer'}
	},
	{
		name: 'orderer'
	}, function(err, role) {
		if(err) throw err;

		User.find({
			where: {username: 'orderer'}
		}, function(err, user) {
			if (err) throw err;

			role.principals.create({
				principalType: RoleMapping.USER,
				principalId: user.id
			}, function(err, principal) {
				if(err) throw err;
			});
		});
	});

	// create approver role
	Role.findOrCreate({
		where: {name: 'approver'}
	},
	{
		name: 'approver'
	}, function(err, role) {
		if(err) throw err;

		User.find({
			where: {username: 'approver'}
		}, function(err, user) {
			if (err) throw err;

			role.principals.create({
				principalType: RoleMapping.USER,
				principalId: user.id
			}, function(err, principal) {
				if(err) throw err;
			});
		});
	});

	// create controller role
	Role.findOrCreate({
		where: {name: 'controller'}
	},
	{
		name: 'controller'
	}, function(err, role) {
		if(err) throw err;

		User.find({
			where: {username: 'approver'}
		}, function(err, user) {
			if (err) throw err;

			role.principals.create({
				principalType: RoleMapping.USER,
				principalId: user.id
			}, function(err, principal) {
				if(err) throw err;
			});
		});
	});

	// create procurementMaster role
	Role.findOrCreate({
		where: {name: 'procurementMaster'}
	},
	{
		name: 'procurementMaster'
	}, function(err, role) {
		if(err) throw err;

		User.find({
			where: {username: 'procurementMaster'}
		}, function(err, user) {
			if (err) throw err;

			role.principals.create({
				principalType: RoleMapping.USER,
				principalId: user.id
			}, function(err, principal) {
				if(err) throw err;
			});
		});
	});

	// create procurementAdmin role
	Role.findOrCreate({
		where: {name: 'procurementAdmin'}
	},
	{
		name: 'procurementAdmin'
	}, function(err, role) {
		if(err) throw err;

		User.find({
			where: {username: 'procurementAdmin'}
		}, function(err, user) {
			if (err) throw err;

			role.principals.create({
				principalType: RoleMapping.USER,
				principalId: user.id
			}, function(err, principal) {
				if(err) throw err;
			});
		});
	});

	// create provider role
	Role.findOrCreate({
		where: {name: 'provider'}
	},
	{
		name: 'provider'
	}, function(err, role) {
		if(err) throw err;

		User.find({
			where: {username: 'provider'}
		}, function(err, user) {
			if (err) throw err;

			role.principals.create({
				principalType: RoleMapping.USER,
				principalId: user.id
			}, function(err, principal) {
				if(err) throw err;
			});
		});
	});
	*/
};