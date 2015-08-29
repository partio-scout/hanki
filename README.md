# fj16_hankinta_backend

Finnjamboree 2016 procurement system backend.

## Prerequisites

Node.JS and PostgreSQL

## Installation

Clone this repository.

In the repository, install dependencies by running:

    npm install

Make sure your local PostgreSQL installation is running, and install the app using:

	./sripts/dev-db-setup.sh

If you have already installed the app and need to reset the database, you can:

	psql template1 postgres < scripts/drop-databases.sql

## Running the app

Run the application with:

    NODE_ENV=dev slc run
