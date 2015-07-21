# fj16_hankinta_backend

Finnjamboree 2016 procurement system backend.

## Prerequisites

Node.JS and PostgreSQL

## Installation

Clone this repository.

In the repository, install dependencies by running:

    npm install

Create the database "fj16-procurement" and a PostgreSQL user "fj16-procurement" with a black password:

    $ psql template1
    template1=# CREATE DATABASE fj16_procurement;
    template1=# CREATE USER fj16_procurement WITH PASSWORD '';
    template1=# GRANT ALL PRIVILEGES ON DATABASE fj16_procurement to fj16_procurement;
    template1=# \q

Import db.sql and data.sql to the database:

    $ psql fj16_procurement fj16_procurement < db.sql
    $ psql fj16_procurement fj16_procurement < data.sql

## Running the app

Run the application with:

    slc run
