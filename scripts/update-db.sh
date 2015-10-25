#!/bin/bash

cd "$(dirname "$0")"

node ../server/migrate/update-schema.js
