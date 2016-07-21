/**
 * Created by Alexander on 9/6/2015.
 */

var gaussian = require('gaussian');
var distribution = gaussian(356, 100);
// Take a random sample using inverse transform sampling method.
var sample = distribution.ppf(Math.random());

for (var i = 0;i < 50;++i) {
    var sample = distribution.ppf(Math.random());
    console.log(sample);
}
