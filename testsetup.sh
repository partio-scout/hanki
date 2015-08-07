#!/bin/bash

dbuser="fj16_procurement_test"
dbname="fj16_procurement_test"

echo "Using database '"$dbname"'."
echo

command="psql template1 postgres"

# Drop all other connections expect this one
# This is needed to be able to drop existing database without problems where someone is still using it
# 
# There is probably better way of doing this, but this works fine on testing
$command -c "SELECT pg_terminate_backend(pg_stat_activity.pid)
	FROM pg_stat_activity
	WHERE pg_stat_activity.datname = '"$dbname"'
  	AND pid <> pg_backend_pid();"

$command -c "DROP DATABASE IF EXISTS "$dbname";"
$command -c "CREATE DATABASE "$dbname";"
$command -c "CREATE USER "$dbuser" WITH PASSWORD 'root';"
$command -c "GRANT ALL PRIVILEGES ON DATABASE "$dbname" TO "$dbuser";"

command="psql "$dbname" "$dbuser""

$command -f db.sql
$command -f data.sql

#c='export NODE_ENV="testing"'
#$c
