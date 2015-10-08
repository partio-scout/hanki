#!/bin/bash

command="psql template1"

echo "Dropping existing databases and users"
$command -c "DROP DATABASE IF EXISTS fj16_procurement;"
$command -c "DROP USER IF EXISTS fj16_procurement;"
$command -c "DROP DATABASE IF EXISTS fj16_procurement_test;"
$command -c "DROP USER IF EXISTS fj16_procurement_test;"
