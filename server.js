require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://hoopla:XxfQnridOJlUHvkC@cluster0.jk4rw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;
var urlSchema = new mongoose.Schema({
  original_url: String,
  new_url: String
});

// build model
var ShortUrl = mongoose.model('ShortUrl', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// You can POST a URL to /api/shorturl and get a JSON response with original_url and short_url properties. Here's an example: { original_url : 'https://freeCodeCamp.org', short_url : 1}
app.post('/api/shorturl', urlencodedParser, function(req, res) {
  // use body-parser to retrieve content of post request
  var url = req.body.url;
  console.log(url);
  // If you pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain { error: 'invalid url' }
  var regex = /^http(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)/;
  if (!regex.test(url)) res.json({ error: 'invalid url' });
  console.log("valid");
  var shorty  = Math.floor(Math.random() * (1000 - 1));
  console.log(shorty);
  
  var shortyDb = new ShortUrl ({ original_url: url, new_url: String(shorty) });
  console.log("created new document");
  
  shortyDb.save(function(err) {
      if (err) return console.error(err);
    });
    
    res.json({ original_url: url, short_url: shorty });
});

// TODO: When you visit /api/shorturl/<short_url>, you will be redirected to the original URL.
app.get('/api/shorturl/:short_url', function(req, res) {
  var shorty = ShortUrl.findOne({ new_url: String(req.params.short_url) }, function(err, result) {
    if (err) return console.log(err);
    console.log("result" + result);
    if (result._id) res.redirect(result.original_url);
    else res.redirect('/');
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
