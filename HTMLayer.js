/**
 * Created by Alexander on 11/20/2015.
 */

var HTMColumn = require('./HTMColumn.js'),
    HTMSynapse = require('./HTMSynapse.js');

var Utils = require('./Utils.js');

var gaussian = require('gaussian');

module.exports = function (config) {
    var self = this;
    this.columns = [];
    this.activeColumns = [];
    this.desiredLocalActivity = config.desiredLocalActivity || 1;
    this.inhibitionRadius = 1;
    this.permanenceInc = 0.05;
    this.permanenceDec = 0.01;
    this.numColumns = config.numColumns || 500;
    this.numPotentialSynapses = config.numPotentialSynapses || 80;
    this.inputBits = config.inputBits || 784;

    /*
     Initialization

     Prior to receiving any inputs, the region is initialized by computing a list of initial
     potential synapses for each column. This consists of a random set of inputs selected
     from the input space. Each input is represented by a synapse and assigned a random
     permanence value.

     The random permanence values are chosen with two criteria:
     1: The values are chosen to be in a small range around connectedPerm
     (the minimum permanence value at which a synapse is considered "connected")
     2: Each column has a natural center over the input region, and the permanence
     values have a bias towards this center (they have higher values near the center)

     */
    this.init = function () {
        for (var i = 0;i < self.numColumns;++i) {
            var c = new HTMColumn({
                minOverlap: config.minOverlap || 20,
                connectedPerm: config.connectedPerm || 0.5
            });
            c.id = i;

            var center = (self.inputBits / self.numColumns) * i;
            var distribution = gaussian(center, self.inputBits);

            for (var j = 0;j < self.numPotentialSynapses;++j) {
                var s = new HTMSynapse();

                /*
                 Each column connects to 50% of the pool (potentialSynapses = 0.5 * Bits). Within the entire range
                 */

                s.sourceInput = Utils.getRandomInt(0, self.inputBits - 1);

                var distanceFromCenter = Math.abs(center - s.sourceInput);

                var permVariance = 0.05;

                s.permanence = (c.connectedPerm - permVariance) + 2 * permVariance * Utils.sigmoid(((self.inputBits - distanceFromCenter) / self.inputBits) * 8 - 4);

                c.potentialSynapses.push(s);
            }

            self.columns.push(c);
        }
    };

    /**
     * Returns the neighbors of the given column
     * c as determined by the inhibitionRadius
     *
     * @param c
     * @returns {Array.<T>}
     */
    this.neighbors = function (c) {
        var cIndex = self.columns.indexOf(c);
        if (cIndex !== -1) {
            var start = Math.max(0, Math.floor(cIndex - self.inhibitionRadius));
            var end = Math.min(Math.floor(cIndex + self.inhibitionRadius), self.columns.length);

            return self.columns.slice(start, end);
        } else {
            console.log('error: invalid column');
            // throw new what?
        }
    };

    /**
     * Returns the maximum active duty cycle of the columns in the given list of columns
     * @param columns
     * @returns {number}
     */
    this.maxDutyCycle = function (columns) {
        var m = 0;
        for (var i = 0;i < columns.length;++i) {
            var c = columns[i];
            if (c.activeDutyCycle > m) {
                m = c.activeDutyCycle;
            }
        }
        return m;
    };

    /**
     *  Returns The radius of the average connected receptive
     *  field size of all columns. The connected receptive field
     *  size includes only the connected synapses (permanence >= connectedPerm)
     *
     * @returns {number}
     */
    this.averageReceptiveFieldSize = function () {
        var fields = [];
        var fieldSum = 0;
        for (var i = 0;i < self.columns.length;++i) {
            var c = self.columns[i];
            var synapses = c.connectedSynapses();
            var inputSources = [];
            for (var j = 0;j < synapses.length;++j) {
                inputSources.push(synapses[j].sourceInput);
            }

            var inputsPerCol = self.inputBits / self.columns.length;

            // divide by inputsPerCol to get receptive field in columns width

            var field = 0;
            if (inputSources.length > 0) {
                field = ((Utils.getMaxOfArray(inputSources) - Utils.getMinOfArray(inputSources)) / inputsPerCol) / 2.0;
            }
            fields.push(field);
            fieldSum += field;
        }
        return fieldSum / fields.length;
    };
};