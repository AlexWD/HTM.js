/**
 * Created by Alexander on 11/20/2015.
 */

var Utils = require('./Utils.js');

function boostFunction (active, min) {
    if (active > min) {
        return 1;
    } else {
        return 1 + (min - active);
    }
}

/*
 Spatial pooling:
 Input: an array of bottom-up binary inputs from sensory data or previous level

 Output: activeColumns(t) - the list of columns that win due to the bottom-up
 input at time t.

 3 Phases:
 1: compute the overlap with the current input for each column
 2: compute the winning columns after inhibition
 3: update synapse permanence and internal variables
 */

module.exports = function(t, layer, input) {
    /*
     Phase 1: Overlap

     Given an input vector, the first phase calculates the overlap of each column with that vector.
     The overlap for each column is simply the number of connected synapses with active inputs,
     multiplied by its boost. If this value is below minOverlap, we set the overlap score to zero.
     */
    for (var i = 0;i < layer.columns.length;++i) {
        var c = layer.columns[i];
        c.overlap = 0;
        c.active = false;

        var connectedSynapses = c.connectedSynapses();
        var numSynapses = connectedSynapses.length;
        for (var j = 0;j < numSynapses;++j) {
            var s = connectedSynapses[j];
            c.overlap = c.overlap + parseInt(input[s.sourceInput]);
        }

        if (c.overlap < c.minOverlap) {
            c.overlap = 0;
        } else {
            c.overlap = c.overlap * c.boost;
        }
    }

    /*
     Phase 2: Inhibition

     The second phase calculates which columns remain as winners after the inhibition step.
     desiredLocalActivity is a parameter that controls the number of columns that end up
     winning. For example, if desiredLocalActivity is 10, a column will be a winner if its overlap
     score is greater than the score of the 10'th highest column within its inhibition radius.
     */

    layer.activeColumns[t] = [];

    for (var i = 0;i < layer.columns.length;++i) {
        var c = layer.columns[i];
        var minLocalActivity = Utils.kthScore(layer.neighbors(c), layer.desiredLocalActivity);
        if (c.overlap > 0 && c.overlap >= minLocalActivity) {
            c.active = true;
            layer.activeColumns[t].push(c);
        }
    }

    /*
     Phase 3: Learning

     The third phase performs learning; it updates the permanence values of all synapses as necessary.
     as well as the boost and inhibition radius.

     For winning columns, if a synapse is active,
     its permanence value is incremented, otherwise it is decremented. Permanence values are constrained
     to be between 0 and 1.

     There are two separate boosting mechanisms in place to help a column learn connections. If a column
     does not win often enough (as measured by activeDutyCycle), its overall boost value is increased.
     Alternatively, if a column's connected synapses do not overlap well with any inputs often enough
     (as measured by overlapDutyCycle), it's permanence values are boosted. Note: once learning is turned
     off, boost(c) is frozen.

     Finally, at the end of Phase 3 the inhibition radius is recomputed.
     */

    for (var i = 0;i < layer.activeColumns[t].length;++i) {
        var c = layer.activeColumns[t][i];
        var numSynapses = c.potentialSynapses.length;
        for (var j = 0;j < numSynapses;++j) {
            var s = c.potentialSynapses[j];
            if (input[s.sourceInput] == 1) {
                s.permanence += layer.permanenceInc;
                s.permanence = Math.min(1.0, s.permanence);
            } else {
                s.permanence -= layer.permanenceDec;
                s.permanence = Math.max(0.0, s.permanence);
            }
        }
    }

    for (var i = 0;i < layer.columns.length;++i) {
        var c = layer.columns[i];

        c.minDutyCycle = 0.01 * layer.maxDutyCycle(layer.neighbors(c));
        c.activeDutyCycle = c.updateActiveDutyCycle(t);
        c.boost = boostFunction(c.activeDutyCycle, c.minDutyCycle);

        c.overlapDutyCycle = c.updateOverlapDutyCycle(t);
        if (c.overlapDutyCycle < c.minDutyCycle) {
            c.increasePermanences(0.1 * c.connectedPerm);
        }
    }
    layer.inhibitionRadius = layer.averageReceptiveFieldSize();
};