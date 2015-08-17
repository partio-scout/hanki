module.exports = function(Title) {
    Title.DataImport = function(csv,cb){
        var Q = require('q');
        var loopback = require('loopback');
        var app = require('../../server/server');
        var Titlegroup = app.models.Titlegroup;
        // var async = require('async');

        function csvJSON(csv){
        // console.log(csv);
          var lines = csv.split("\\n");
        //   console.log(lines[0]);
        //  console.log(lines);
          var result = [];
          var headers = lines[0].split(",");
        //    console.log(headers);
          for(var i = 1; i < lines.length; i++){
        	  var obj = {};
        	  var currentline = lines[i].split(",");
        	  for(var j = 0; j < headers.length; j++){
        		  obj[headers[j]] = currentline[j];
        	  }
        	  result.push(obj);
          }
          return result; //JavaScript object
        //   return JSON.stringify(result); //JSON
        }


        var result = csvJSON(csv);
        console.log(result);

        //promise-viritelmä alkaa
        var Titlegroup_exists = Q.denodeify(Titlegroup.exists);
        console.log('täällä');
        var Title_create = Q.denodeify(Title.create);
        console.log('täälläkin');
        for (var i = 0; i < result.length; i++){
            console.log(result[i].titlegroupId);
            Titlegroup_exists(result[i].titlegroupId)
            .then(function(bool){
                console.log(bool);
                if (!bool) result[i].titlegroupId = 0;
            }, null)
            .then(Title_create(result).then(function(result){
                console.log('melkein valmis');
                cb(null, result);
            }, function(err){
                    console.log(err);
                    cb(err,null);
                })
        );

    }
    Title.remoteMethod(
        'DataImport',
        {
            http: {path: '/DataImport', verb: 'post'},
            accepts: {arg: 'csv', type: 'string'},
            returns: {arg: 'result', type: 'string'}
        }
    );
};
