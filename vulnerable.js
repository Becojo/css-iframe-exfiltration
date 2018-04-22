var express = require('express');
var app = express();
var colors = require('colors');


app.get('/', function(req, res) {
    console.log(`${'[VULN]'.green} /?input=${req.query.input}`);

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

    <form action="">
      <input name="input" type="text" value="XSS here"/>
    </form>

    <p>${req.query.input || ""}</p>


    <a href="/poc">POC</a>
  </body>
</html>
`);
});

module.exports.app = app;
