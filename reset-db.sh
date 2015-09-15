#!/bin/bash

command="psql template1 postgres"

$command -c "DROP DATABASE IF EXISTS fj16_procurement;"
$command -c "CREATE DATABASE fj16_procurement;"
$command -c "GRANT ALL PRIVILEGES ON DATABASE fj16_procurement TO fj16_procurement;"

command="psql fj16_procurement fj16_procurement"

$command -f db.sql
$command -f data.sql
