// Request is usually a SuperTest instance
function createRestfulResourceClass(request) {

  class RestfulResource {
    constructor(endpoint, accessToken) {
      this.endpoint = endpoint;
      this.accessToken = accessToken ? accessToken.id : null;
    }

    path(modifier) {
      modifier = (modifier !== undefined) ? ('/' + modifier) : '';
      return this.endpoint + modifier + '?access_token=' + this.accessToken;
    }

    _handleResponse(cb) {
      return function(err, res) {
        if (!err && res.status >= 400) {
          err = {
            message: 'Rest Error: ' + res.req.url + ' returned HTTP ' + res.status,
            status: res.status
          };
        }
        res = res.hasOwnProperty('body') ? res.body : res;
        cb(err, res);
      };
    }

    findById(id, cb) {
      request.get(this.path(id)).end(this._handleResponse(cb));
    }

    raw(method, path, cb) {
      request(method, this.path(path)).end(this._handleResponse(cb));
    }
  }

  return RestfulResource;

}

module.exports = createRestfulResourceClass;
