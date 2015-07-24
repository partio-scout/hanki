module.exports = function(app) {
	var Role = app.models.Role;
	var User = app.models.User;

	// create roles if they don't already exist

	// create orderer role
	Role.findOrCreate({
		where: {name: 'orderer'}
	},
	{
		name: 'orderer'
	}, function(err, role) {
		if(err) throw err;
	});

	// create approver role
	Role.findOrCreate({
		where: {name: 'approver'}
	},
	{
		name: 'approver'
	}, function(err, role) {
		if(err) throw err;
	});

	// create controller role
	Role.findOrCreate({
		where: {name: 'controller'}
	},
	{
		name: 'controller'
	}, function(err, role) {
		if(err) throw err;
	});

	// create procurementMaster role
	Role.findOrCreate({
		where: {name: 'procurementMaster'}
	},
	{
		name: 'procurementMaster'
	}, function(err, role) {
		if(err) throw err;
	});

	// create procurementAdmin role
	Role.findOrCreate({
		where: {name: 'procurementAdmin'}
	},
	{
		name: 'procurementAdmin'
	}, function(err, role) {
		if(err) throw err;
	});
};