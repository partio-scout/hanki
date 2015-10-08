#!/bin/bash

procurement_user_password="root"

cd "$(dirname "$0")"

command="psql template1"

# Create and populate dev database
$command -c "CREATE USER fj16_procurement WITH PASSWORD '$procurement_user_password';"
$command -c "ALTER USER fj16_procurement CREATEDB;"
PGPASSWORD="$procurement_user_password" psql template1 fj16_procurement -c "CREATE DATABASE fj16_procurement;"
node ../server/migrate/create-schema.js
node ../server/migrate/create-test-fixtures.js

# Create test database
$command -c "CREATE USER fj16_procurement_test WITH PASSWORD '$procurement_user_password';"
$command -c "ALTER USER fj16_procurement_test CREATEDB;"
PGPASSWORD="$procurement_user_password" psql template1 fj16_procurement_test -c "CREATE DATABASE fj16_procurement_test;"

echo
echo "*** If you see no errors above, installation succeeded. ***"
