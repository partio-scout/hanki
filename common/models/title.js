module.exports = function(Title) {
    Title.DataImport = function(csv,cb){
        // var Promise = require('promise');
        var loopback = require('loopback');
        var app = require('../../server/server');
        var Titlegroup = app.models.Titlegroup;
        var async = require('async');
        // var myTitlegroupexists = Promise.denodeify(Titlegroup.exists);

        // var promise1 = new Promise(function(resolve,reject){
        //     Titlegroup.exists(object.titlegroupId, function(err, bool){
        //         if (err) reject(err);
        //         else resolve(bool);
        //     });
        // });


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
        //   console.log(result);
          return result; //JavaScript object
        //   return JSON.stringify(result); //JSON
        }
        // console.log(csv);
        var result = csvJSON(csv);
        console.log(result);


        function CheckResults(object){
            async.parallel([
                function(callback) {
                    Titlegroup.exists(object.titlegroupId, function(err, bool) {
                        callback(null, bool);
                    });
                }

            ],
            function(err, array) {
                // console.log(array);
                console.log('Täällä mennään');
                if (!array[0]) object.titlegroupId = 0;
                // console.log('täällä ollaan', object);
                Title.create(object, function(err,object) {
                                if (err) cb(err);
                                // else console.log(object);
                            });

            });
        }

        async.each(result, CheckResults, function(err) {
            console.log('Päästiin tänne');
            if (err) console.log(err);
            else {
                // Title.destroyAll(function(err){});
                console.log('Täälläkin mennään');

                cb(null,result);
            }
        });
        // console.log(result);

    };



    Title.remoteMethod(
        'DataImport',
        {
            http: {path: '/DataImport', verb: 'post'},
            accepts: {arg: 'csv', type: 'string'},
            returns: {arg: 'result', type: 'string'}
        }
    );
};
