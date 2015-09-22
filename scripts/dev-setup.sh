#!/bin/bash

cd "$(dirname "$0")"

read -p "Enter the name of the PostgreSQL superuser on your system. On Linux, it's usually 'postgres', on OS X it's usually your current user's name ("$USER"): " dbuser
echo 

command="psql template1 "$dbuser""

# Ask if want try to drop existing users and databases
echo "If you have not installed the app before, you can safely select NO to next question. However, if you are not sure or have installed app previously, you should select YES option"
read -p "Do you want to drop existing databases and users? [Y/n] " -n 1 -r
echo 
if [[ $REPLY =~ ^[Yy]$ ]]; then
	# Try dropping existing databases and users
	echo "Dropping existing databases and users"
	$command -c "DROP DATABASE IF EXISTS fj16_procurement;"
	$command -c "DROP USER IF EXISTS fj16_procurement;"
	$command -c "DROP DATABASE IF EXISTS fj16_procurement_test;"
	$command -c "DROP USER IF EXISTS fj16_procurement_test;"
fi


# Create and populate dev database
$command -c "CREATE USER fj16_procurement WITH PASSWORD 'root';"
$command -c "ALTER USER fj16_procurement CREATEDB;"
psql template1 fj16_procurement -c "CREATE DATABASE fj16_procurement;"
node ../server/migrate/create-schema.js
node ../server/migrate/create-test-fixtures.js

# Create test database
$command -c "CREATE USER fj16_procurement_test WITH PASSWORD 'root';"
$command -c "ALTER USER fj16_procurement_test CREATEDB;"
psql template1 fj16_procurement_test -c "CREATE DATABASE fj16_procurement_test;"

echo
echo "*** If you see no errors above, installation succeeded. ***"
