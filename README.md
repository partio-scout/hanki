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
## Developing without Vagrant
### Prerequisites

Node.JS and PostgreSQL

### Installation

Clone this repository.

In the repository, install dependencies by running:

    npm install

Make sure your local PostgreSQL installation is running, and set up dev environment with:

	npm run dev-setup

If you have already installed the app and need to reset the database, you can:

	./scripts/reset-db.sh

### Running the app

Run the application with:

    NODE_ENV=dev slc run
