/**
 * Created by Alexander on 11/20/2015.
 */

module.exports = function (config) {
    var self = this;
    this.potentialSynapses = [];
    this.overlap = 0;
    this.boost = 1.4;
    this.minDutyCycle = 0;
    this.activeDutyCycle = 0;
    this.overlapDutyCycle = 0;
    this.active = false;
    this.minOverlap = config.minOverlap || 20;
    this.connectedPerm = config.connectedPerm || 0.5;

    this.synapseConnected = function (s) {
        return s.permanence >= self.connectedPerm;
    };

    this.connectedSynapses = function () {
        var synapses = [];
        for (var i = 0;i < self.potentialSynapses.length;++i) {
            var s = self.potentialSynapses[i];
            if (self.synapseConnected(s)) {
                synapses.push(s);
            }
        }
        return synapses;
    };

    /**
     * Computes a moving average of how often column c has been active after inhibition
     * @type {Array}
     */
    self.updateactives = [];
    this.updateActiveDutyCycle = function (t) {
        if (self.active) {
            self.updateactives.push(1);
        } else {
            self.updateactives.push(0);
        }

        self.updateactives = self.updateactives.slice(-1000);

        return self.updateactives.reduce(function (a, b) {
                return a + b;
            }) / self.updateactives.length;
    };

    /**
     * Computes a moving average of how often column c has overlap greater than minOverlap
     * @type {Array}
     */
    this.overlaps = [];
    this.updateOverlapDutyCycle = function () {
        if (self.overlap > self.minOverlap) {
            self.overlaps.push(1);
        } else {
            self.overlaps.push(0);
        }

        self.overlaps = self.overlaps.slice(-1000);

        return self.overlaps.reduce(function (a, b) {
                return a + b;
            }) / self.overlaps.length;
    };

    /**
     * Increase the permanence values of every synapse in column c by a scale factor s
     * @param s
     */
    this.increasePermanences = function (s) {
        for (var i = 0;i < self.potentialSynapses.length;++i) {
            var s = self.potentialSynapses[i];
            s.permanence *= s;
        }
    };
};