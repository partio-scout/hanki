# fj16_hankinta_backend

Finnjamboree 2016 procurement system backend.

## Developing with Vagrant
### Prerequisites
You will need [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/) on your machine.

### Installation
Clone this repository into a local directory. Enter the project directory on a command line. Initialize the Vagrant virtual machine with the command `vagrant up`. This will create a virtual machine for you and install all the required software in it.

### Running the app
Enter the project directory. If you don't have the Vagrant virtual machine running, run `vagrant up` (you can check the status with `vagrant status`). Then run `vagrant ssh` to access the virtual machine.

Inside the virtual machine run `npm start` inside the `/vagrant` directory.

The application will be available at http://localhost:3000/, from both the host and guest operating systems.

Note that the virtual machine has the `NODE_ENV`-environment variable set to `dev`, so to run in production mode, run with `NODE_ENV=production npm start`.

### Creating users
```
npm run create-user -- <member number> <user email> <user role> [<user role>...] [--costcenter <code>...] [--approverOf <code>...] [--controllerOf <code>...]
```
Member number needs to be 7 characters long. You will need to specify at least one role for the user. To see a list of roles, see [the role fixture file](common/fixtures/all/Role.json). Use the costcenter, approverOf and controllerOf flags to specify which cost centers the user can access, approve or control, respectively.

### Logging in

You can obtain a login URL by running:
```
npm run dev-login <user email>
```

### Resetting the dev database

If you simply want to reset the development database contents you can:
```
npm run reset-database
```

### Extra good stuff
By default file change events do not propagate between the host and virtual machine. Therefore the webpack development server and test watcher won't function properly. The notification can be easily enabled though with a vagrant plugin. If you already have vagrant running, destroy your current virtual machine with `vagrant destroy`. Then run `vagrant plugin install vagrant-notify-forwarder`, then recreate the virtual machine with `vagrant up` and enjoy your file watchers!

### Further reading
For more information on the use of Vagrant, see [the Vagrant documentation](https://docs.vagrantup.com/v2/)

## Developing without Vagrant
### Prerequisites

Node.JS and PostgreSQL

### Installation

Clone this repository.

In the repository, install dependencies by running:
```
npm install
```

Make sure your local PostgreSQL installation is running, and set up dev environment with:
```
sudo -u postgres npm run dev-setup
```

Or, if you're using OS X:
```
npm run dev-setup
```
To remove development and test databases, you can run:
```
sudo -u postgres npm run dev-teardown
```
Or, if you're using OS X:
```
npm run dev-teardown
```
If you simply want to reset the development database contents you can:
```
npm run reset-database
```
### Running the app

Run the application with:
```
NODE_ENV=dev npm start
```
(then connect to localhost:3000 with your browser to see)

## Running tests

If you are not using vagrant, download the selenium standalone server and run it to be able to run the integration tests:

```
wget "http://selenium-release.storage.googleapis.com/2.48/selenium-server-standalone-2.48.2.jar"
java -jar selenium-server-standalone-2.48.2.jar
```

Tests include linter, API and interation tests. Run all tests and checks:
```
npm test
```

You can also run only the linter with `npm run linter`, API tests with `npm run test-backend` and integration tests with `npm run test-e2e`.
