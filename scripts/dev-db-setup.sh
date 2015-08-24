#!/bin/bash

cd "$(dirname "$0")"

read -p "Enter the name of the PostgreSQL superuser on your system. On Linux, it's usually 'postgres', on OS X it's usually your current user's name ("$USER"): " dbuser

command="psql template1 "$dbuser""

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

echo "*** If you see no errors above, installation succeeded. ***"
