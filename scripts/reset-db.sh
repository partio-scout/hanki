#!/bin/bash

cd "$(dirname "$0")"

node ../server/migrate/update-schema.js
#node ../server/migrate/create-schema.js # drops tables before creating
node ../server/migrate/create-test-fixtures.js
