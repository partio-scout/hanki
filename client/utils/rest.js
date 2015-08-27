// Request is usually a SuperTest instance
function createRestfulResourceClass(request) {

  class RestfulResource {
    constructor(endpoint, accessToken) {
      this.endpoint = endpoint;
      this.accessToken = accessToken;
    }

    findById(id, cb) {
      setTimeout(function() {
        cb({
          email: 'asdsad@jallu.rodeo'
        });
      }, 2000);
    }
  }

  return RestfulResource;

}

module.exports = createRestfulResourceClass;
