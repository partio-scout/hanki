function createRestfulResourceClass(request) {

  class RestfulResource {
    constructor(endpoint, accessToken) {
      this.endpoint = endpoint;
      this.accessToken = accessToken ? accessToken.id : null;
    }

    path(basePath, filters) {
      basePath = (basePath !== undefined) ? ('/' + basePath) : '';
      filters = (filters !== undefined) ? '&' + filters : '';
      return this.endpoint + basePath + '?access_token=' + this.accessToken + filters;
    }

    _handleResponse(cb) {
      return function(err, res) {
        if (!err && res.status >= 400) {
          err = {
            message: 'REST Error: ' + res.req.url + ' returned HTTP ' + res.status,
            status: res.status
          };
        }
        res = res.hasOwnProperty('body') ? res.body : res;
        cb(err, res);
      };
    }

    findAll(cb, filters) {
      request.get(this.path('', filters)).end(this._handleResponse(cb));
    }

    findById(id, cb) {
      request.get(this.path(id)).end(this._handleResponse(cb));
    }

    create(obj, cb) {
      request.post(this.path('')).send(obj).end(this._handleResponse(cb));
    }

    update(id, obj, cb) {
      request.put(this.path(id)).send(obj).end(this._handleResponse(cb));
    }

    del(id, cb) {
      request.del(this.path(id)).end(this._handleResponse(cb));
    }

    raw(method, path, cb) {
      request(method, this.path(path)).end(this._handleResponse(cb));
    }
  }

  return RestfulResource;

}

module.exports = createRestfulResourceClass;
