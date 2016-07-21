/**
 * Created by Alexander on 11/20/2015.
 */

var Utils = require('./Utils.js');

var Col = function (overlap) {
    this.overlap = overlap;
};

var cols = [];

cols.push(new Col(90));
cols.push(new Col(190));
cols.push(new Col(105));
cols.push(new Col(165));
cols.push(new Col(65));

console.log(Utils.kthScore(cols, 2));