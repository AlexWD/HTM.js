/**
 * Created by Alexander on 12/8/2015.
 */

var fs = require('fs');

var data = [];

exports.load = function () {
    var dataFileBuffer = fs.readFileSync(__dirname + '/train-images.idx3-ubyte');
    var labelFileBuffer = fs.readFileSync(__dirname + '/train-labels.idx1-ubyte');
    var pixelValues = [];

    var input = [];
    var labels = [];

    for (var image = 0; image <= 20000; image++) {
        var pixels = [];

        for (var x = 0; x <= 27; x++) {
            for (var y = 0; y <= 27; y++) {
                pixels.push(dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 15]);
            }
        }

        var imageData = {};
        imageData[JSON.stringify(labelFileBuffer[image + 8])] = pixels;
        labels.push(JSON.stringify(labelFileBuffer[image + 8]));

        input.push(pixels);

        pixelValues.push(imageData);
    }

    for (var i = 0; i < input.length; ++i) {
        for (var j = 0; j < input[i].length; ++j) {
            if (input[i][j] >= 50) {
                input[i][j] = 1;
            } else {
                input[i][j] = 0;
            }
        }
    }

    for (var i = 0;i < input.length;++i) {
        data.push({
            label: labels[i],
            input: input[i]
        });
    }
};

exports.getLines = function (start, length) {
    return data.slice(start, start + length);
};