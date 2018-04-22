var vulnerable = require('./vulnerable');
var attack = require('./attack');

vulnerable.app.listen(3000, function () {
    console.log('Vulnerable website running on port 3000!');
});

attack.app.listen(3001, function () {
    console.log('Attack website running on port 3001!');
});
