# fj16_hankinta_backend

Finnjamboree 2016 procurement system backend.

## Prerequisites

Node.JS and PostgreSQL

## Installation

Clone this repository.

In the repository, install dependencies by running:

    npm install

Make sure your local PostgreSQL installation is running, and set up dev environment with:

  npm run dev-setup

If you have already installed the app and need to reset the database, you can:

  ./scripts/reset-db.sh

## Running the app

Run the application with:

    NODE_ENV=dev slc run

(then connect to localhost:3000 with your browser to see)

## Running tests

Make sure Selenium server is runing berfore running integration tests. Run Selenium server with:

	java -jar e2e-tests/libs/selenium-server-standalone-2.47.1.jar

Tests include linter, API and interation tests. Run all tests and checks:

	npm test
