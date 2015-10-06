#!/bin/bash

cd "$(dirname "$0")"

dbuser="fj16_procurement_test"
dbname="fj16_procurement_test"
dbpass="root"

echo "Using database '"$dbname"'."
echo

# Drop all other connections expect this one
# This is needed to be able to drop existing database without problems where someone is still using it
#
# There is probably better way of doing this, but this works fine on testing
#
# Currently this command assumes postgres admin user to be "postgres". If your system uses another
# admin user for postgres, you should run this command manually with that user. You only need to
# run this command if you have have opened another session to the test database, which is not
# usually the case.
#
sudo -u postgres psql template1 postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid)
	FROM pg_stat_activity
	WHERE pg_stat_activity.datname = '"$dbname"'
  	AND pid <> pg_backend_pid();"

PGPASSWORD="$dbpass" psql template1 $dbuser -c "DROP DATABASE IF EXISTS "$dbname";"
PGPASSWORD="$dbpass" psql template1 $dbuser -c "CREATE DATABASE "$dbname";"

node ../server/migrate/create-schema.js
node ../server/migrate/create-test-fixtures.js
