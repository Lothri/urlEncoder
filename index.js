let express = require('express');
let app = new express();
let bodyParser = require('body-parser');
let dns = require('dns');
const { truncateSync } = require('fs');
let info_address;
let address_list = [];
let address_number = 1;


// app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile( __dirname + '/views/index.html' );
  console.log("somebody getted");
});

app.post('/api/shorturl', function(req, res) {
  console.log('somebody posted');

  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Origin', '*');
  
  /* Tests if the POST request input includes the https protocol */
  let req_url = String(req.body.addr);
  console.log("requestedURL: " + req_url);

  if ((/https/i).test(req_url) === false || (/www/i).test(req_url) === false ) {
    console.log("The POST request body wasn't a valid URL.");
    res.json( {
      "error": 'invalid url'
    });
    res.status(404).end();
  }
  else {
    /* Checks if the address points to an ip addr 
    (before that, parses req_url to be suitable for dns lookup function, which doesn't accept protocol names) */

    req_url_parsed = req_url.replace(/^https:\/\//, "");
    console.log('parsedURL: ' + req_url_parsed);

    dns.lookup(req_url_parsed,
      (err, address) => {
        if (err) {console.log(err);}
        info_address = address;
      });
    
    // if (info_address.match(/[0-9]\.[0-9]\.[0-9]\.[0-9]/g) === true) {
    //   address_list[address_number] = req_url;
    // }
    address_list.push(
      {
        "number": address_number,
        "website": req_url
      }
    );
    res.json({
      original_url: address_list[address_number-1].website,
      short_url: address_list[address_number-1].number
      });
    address_number++;
  }
});


/* If a valid integer is sent in a GET request, redirects to
corresponding url */
app.get('/api/shorturl/:number', (req, res) => {
  console.log('somebody getted to redirect');
  if ((/[0-9]/g).test(req.params.number) === true)  {
    console.log('got through regex test');
    res.redirect(address_list.filter(function(obj) {
      return obj.number == req.params.number;
    })[0].website)
    
  }
  else {res.send("Send a route with an integer number.")}
});

const listener = app.listen(3000);