#!/bin/bash

dbuser="fj16_procurement_test"
dbname="fj16_procurement_test"

echo "Using database '"$dbname"'."
echo

# ask for postgresql superuser name and save it to file to make future testing faster,
# because then there is no need to type it in every time
if [ -f scripts/dbadmin.txt ]; then
	dbadmin=$(<scripts/dbadmin.txt)
else
	echo "Enter the name of the PostgreSQL superuser on your system. On Linux, it's usually 'postgres', on OS X it's usually your current user's name ("$USER")"
	echo "You need to enter this only once, because it's stored to a file scripts/dbadmin.txt"
	read -p ">" dbadmin
	echo $dbadmin >> scripts/dbadmin.txt
fi

command="psql template1 "$dbadmin

# Drop all other connections expect this one
# This is needed to be able to drop existing database without problems where someone is still using it
# 
# There is probably better way of doing this, but this works fine on testing
$command -c "SELECT pg_terminate_backend(pg_stat_activity.pid)
	FROM pg_stat_activity
	WHERE pg_stat_activity.datname = '"$dbname"'
  	AND pid <> pg_backend_pid();"

command="psql template1 "$dbuser

$command -c "DROP DATABASE IF EXISTS "$dbname";"
$command -c "CREATE DATABASE "$dbname";"

node server/migrate/create-schema.js
node server/migrate/create-test-fixtures.js

#c='export NODE_ENV="testing"'
#$c
