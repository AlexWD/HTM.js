/**
 * Created by Alexander on 11/20/2015.
 */

exports.getMaxOfArray = function (numArray) {
    return Math.max.apply(null, numArray);
};

exports.getMinOfArray = function (numArray) {
    return Math.min.apply(null, numArray);
};

exports.sigmoid = function (t) {
    return 1/(1+Math.pow(Math.E, -t));
};

exports.getRandomArbitrary = function (min, max) {
    return Math.random() * (max - min) + min;
};

exports.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.kthScore = function (columns, k) {
    k = k - 1;
    if (columns.length < k)
        return 0;
    var scores = [];
    for (var i = 0;i < columns.length;++i) {
        scores.push(columns[i].overlap);
    }
    scores.sort(function(a, b) {
        return b - a;
    });
    if (!scores[k])
        return 0;
    return scores[k];
};