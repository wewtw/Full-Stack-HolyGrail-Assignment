var express = require('express');
var app     = express();
var redis = require("redis");

// create a new Redis client to connect to the Redis database at def port

var client = redis.createClient(); 
//Step2:run the redis database insde docker with 
//docker run -p 6379:6379 -it redis/redis-stack-server:latest make sure you got docker started.



// serve static files from public directory
app.use(express.static('public'));


// initialize the Redis values to 0
client.mset('header',0,'left',0,'article',0,'right',0,'footer',0);

// retrieve the values of the Redis keys 'header', 'left', 'article', 'right', 'footer'
client.mget(['header','left','article','right','footer'], 
  function(err, value) {
    console.log(value);
});   

// create a Promise to retrieve the values of the Redis keys 'header', 'left', 'article', 'right', 'footer'
function data(){
    return new Promise((resolve, reject) => {
        client.mget(['header','left','article','right','footer'], 
            function(err, value) {
                // store the values in an object and convert them to numbers
                const data = {
                    'header':  Number(value[0]),
                    'left':    Number(value[1]),
                    'article': Number(value[2]),
                    'right':   Number(value[3]),
                    'footer':  Number(value[4])
                };
                // reject the Promise if there was an error, otherwise resolve it with the data object
                err ? reject(null) : resolve(data);
            }
        );
    });    
}

// get key data
// handle HTTP GET requests to the '/data' endpoint
// this endpoint returns the current values of the Redis keys 'header', 'left', 'article', 'right', 'footer'
app.get('/data', function (req, res) {
    data() // retrieve the Redis key values           
        .then(data => {
            console.log(data); // log the data object to the console
            res.send(data); // send the data object as the HTTP response body               
        });
});


// handle HTTP GET requests to the '/update/:key/:value' endpoint
// this endpoint updates the value of a Redis key and returns the current values of all Redis keys
app.get('/update/:key/:value', function (req, res) {
    const key = req.params.key; // get the key parameter from the URL
    let value = Number(req.params.value);// get the value parameter from the URL and convert it to a number
    client.get(key, function(err, reply) {

        // new value
        // calculate the new value by adding the current value of the Redis key to the new value from the URL
        value = Number(reply) + value;
         // set the value of the Redis key to the new value
        client.set(key, value);

        // return data to client
        // retrieve the current values(data) of all Redis keys and return them to the client
        data()            
            .then(data => {
                console.log(data); // log the data object to the console
                res.send(data); // send the data object as the HTTP response body               
            });
    });   
});
// start the express application and listen for incoming HTTP requests on port 3000
app.listen(3000, () => {
  console.log('Running on 3000');
});

// when the Node.js process exits, close the Redis client
process.on("exit", function(){
    client.quit();
});