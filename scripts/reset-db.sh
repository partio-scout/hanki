#!/bin/bash

cd "$(dirname "$0")"

SKIP_DATABASE_UPDATE="true" node ../server/migrate/create-schema.js # drops tables before creating
SKIP_DATABASE_UPDATE="true" node ../server/migrate/create-test-fixtures.js
