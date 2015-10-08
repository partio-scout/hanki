#!/bin/bash

cd "$(dirname "$0")"

dbuser="fj16_procurement_test"
dbname="fj16_procurement_test"
dbpass="root"

echo "Using database '"$dbname"'."
echo

node ../server/migrate/create-schema.js
node ../server/migrate/create-test-fixtures.js
