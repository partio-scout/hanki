
if (process.env.CI) {
  module.exports = {
    'db': {
      'host': '127.0.0.1',
      'port': 5432,
      'database': 'circle_test',
      'username': 'ubuntu',
      'password': '',
      'name': 'db',
      'connector': 'postgresql'
    }
  };
} else {
  module.exports = {
    'db': {
      'host': '127.0.0.1',
      'port': 5432,
      'database': 'fj16_procurement_test',
      'username': 'fj16_procurement_test',
      'password': 'root',
      'name': 'db',
      'connector': 'postgresql'
    }
  };
}
