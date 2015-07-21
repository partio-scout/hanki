# fj16_hankinta_backend

Finnjamboree 2016 procurement system backend.

## Prerequisites

Node.JS and PostgreSQL

## Installation

Clone this repository.

In the repository, install dependencies by running:

    npm install

Make sure your local PostgreSQL installation is running, and connect to it using:

    psql template1 postgres
    
While connected to PostgreSQL, create the database "fj16_procurement" and a PostgreSQL user "fj16_procurement" with a black password:

    CREATE DATABASE fj16_procurement;
    CREATE USER fj16_procurement WITH PASSWORD '';
    GRANT ALL PRIVILEGES ON DATABASE fj16_procurement to fj16_procurement;

Close the connection by typing:

    \q

Import db.sql and data.sql to the database:

    $ psql fj16_procurement fj16_procurement < db.sql
    $ psql fj16_procurement fj16_procurement < data.sql

## Running the app

Run the application with:

    slc run
