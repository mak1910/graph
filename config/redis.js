var redis 	= require('redis');
var client 	= redis.createClient({ db: 0 });
 
client.on("error", function (err) {
    console.log("Error " + err);
});
 
