module.exports = function(Title) {
    Title.DataImport = function(csv,cb){
        var loopback = require('loopback');
        var app = require('../../server/server');
        var Titlegroup = app.models.Titlegroup;

        function csvJSON(csv){
        // console.log(typeof csv);
          var lines=csv.split("\\n");
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
        var ehto;
        var result = csvJSON(csv);


        // tarkistetaan tietojen oikeellisuus ja lisätään objekti kantaan
        for (var i=0;i<result.length;i++) {
        //    console.log(result[i].titlegroupId);
            (function(index) {
                Titlegroup.exists(result[index].titlegroupId,function(err, bool) {
                    if (!bool) result[index].titlegroupId = 0;
                    Title.create(result[index], function(err,object){
                        if (err) cb(err);

                    });
                });
            })(i);
                // result[i].titlegroupId = 0;


        }

        //console.log(JSON.stringify(result));
        cb(null);
    };
//};


    Title.remoteMethod(
        'DataImport',
        {
            http: {path: '/DataImport', verb: 'post'},
            accepts: {arg: 'csv', type: 'string'},
            returns: {arg: 'result', type: 'string'}
        }
    );
};
