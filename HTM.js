/**
 * Created by Alexander on 9/6/2015.
 */

var HTMLayer = require('./HTMLayer.js');
var HTMSP = require('./HTMSP.js');

module.exports = function () {
    var self = this;
    this.layers = [];

    this.addLayer = function (config) {
        var layer = new HTMLayer(config);

        // initialize potential synapses
        layer.init();

        self.layers.push(layer);
    };

    this.resetCounter = function (l) {
        // keep track of activity
        var layer = self.layers[l];
        var numCols = layer.columns.length;

        for (var i = 0;i < layer.columns.length;++i) {
            layer.columns[i].activeWhen = Array.apply(null, Array(10)).map(Number.prototype.valueOf, 0);
        }
    }

    this.run = function (lines, l) {
        var layer = self.layers[l]; // just one layer, for now

        var numColumns = layer.columns.length;

        var inputCounts = Array.apply(null, Array(10)).map(Number.prototype.valueOf, 0);

        self.resetCounter(l);

        var output = [];

        for (var i = 0;i < lines.length;++i) {

            var label = lines[i].label,
                input = lines[i].input;

            HTMSP(i, layer, input);

            ++inputCounts[label];

            var active = layer.activeColumns[i];
            var activeIds = [];
            var activeCols = Array.apply(null, Array(numColumns)).map(Number.prototype.valueOf, 0);
            for (var j = 0;j < active.length;++j) {
                var col = active[j];
                activeIds.push(col.id);

                activeCols[col.id] = 1;

                // count activity
                ++col.activeWhen[label];
            }

            output.push({
                label: label,
                input: activeCols
            });

            console.log(label + ': ' + activeIds.join(', '));
        }

        // show col activity
        for (var i = 0;i < layer.columns.length;++i) {
            var col = layer.columns[i];
            var activity = [];
            for (var j = 0;j < 10;++j) {
                activity.push((col.activeWhen[j] / inputCounts[j]).toFixed(2));
            }
            console.log('Col #' + i + ': ' + activity.join(', '));
        }

        // return an array of the active columns for each input
        return output;
    };
};