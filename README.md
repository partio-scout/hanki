# fj16_hankinta_backend

Finnjamboree 2016 procurement system backend.

## Developing with Vagrant
### Prerequisites
You will need [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/) on your machine.

### Installation
Clone this repository into a local directory. Enter the project directory on a command line. Initialize the Vagrant virtual machine with the command `vagrant up`. This will create a virtual machine for you and install all the required software in it.

### Running the app
Enter the project directory. If you don't have the Vagrant virtual machine running, run `vagrant up` (you can check the status with `vagrant status`). Then run `vagrant ssh` to access the virtual machine.

Inside the virtual machine run `slc run` inside the `/vagrant` directory.

The application will be available at http://localhost:3000/, from both the host and guest operating systems.

Note that the virtual machine has the `NODE_ENV`-environment variable set to `dev`, so to run in production mode, run with `NODE_ENV=production slc run`.

### Resetting the dev database

If you simply want to reset the development database contents you can:

  npm run reset-database

### Further reading
For more information on the use of Vagrant, see [the Vagrant documentation](https://docs.vagrantup.com/v2/)

## Developing without Vagrant
### Prerequisites

Node.JS and PostgreSQL

### Installation

Clone this repository.

In the repository, install dependencies by running:

  npm install

Make sure your local PostgreSQL installation is running, and set up dev environment with:

  sudo -u postgres npm run dev-setup

Or, if you're using OS X:

  npm run dev-setup

To remove development and test databases, you can run:

  sudo -u postgres npm run dev-teardown

Or, if you're using OS X:

  npm run dev-teardown

If you simply want to reset the development database contents you can:

  npm run reset-database

### Running the app

Run the application with:

    NODE_ENV=dev slc run

   (then connect to localhost:3000 with your browser to see)

## Running tests

Run the tests with

     npm test
