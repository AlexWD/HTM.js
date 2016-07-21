/**
 * Created by Alexander on 9/6/2015.
 */


var MNIST = require('./MNIST.js');
var HTM = require('./HTM.js');

MNIST.load();

/*
 Test System:

 Input: 784 bits
 Columns: 500
 potentialSynapses: 32/column
 minOverlap: 15

 byte >= 50 is considered black (1), otherwise white (0)
 */


var nn = new HTM();

nn.addLayer({
    numColumns: 500,
    numPotentialSynapses: 392,
    inputBits: 784,
    connectedPerm: 0.5,
    minOverlap: 20,
    desiredLocalActivity: 8
});

nn.addLayer({
    numColumns: 20,
    numPotentialSynapses: 200,
    inputBits: 200,
    connectedPerm: 0.5,
    minOverlap: 3,
    desiredLocalActivity: 1
});

var lines = MNIST.getLines(0, 5000);


nn.run(lines, 0);

var lines = MNIST.getLines(0, 1000);

var layer1Activity = nn.run(lines, 0);

nn.run(layer1Activity, 1);