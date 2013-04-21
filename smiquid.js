// Provided by the shim
window["c"] = document.getElementById("main");
window["a"] = c.getContext("2d");
window["b"] = document.body;

(function() {

// Prepare and precalculate stuff...

var

    // Store window and document in minifiable variables
    win = window,
    doc = document,
    ffff = 65535,
    fullCircle = ffff+1,
    halfCircle = fullCircle>>1,
    quarterSpin = fullCircle>>2,
    
    // Store Math.sin, Math.floow and PI in minifiable variables
    math = Math,
    sin = math.sin,
    floor = math.floor,
    pi = 4 * math.atan(1),
    max = math.max,
    min = math.min,
    random = math.random,
    
    // Fetch the canvas element, then set and store the width and height of the canvas element,
    // as well as half of the widght and half of the height
    height, width,
    halfWidth = (width = floor(c.width = 4/3*(c.height = height = math.min(256, innerHeight)))) / 2,
    halfHeight = height / 2,
    
    // Precalculate 65536 sinus values for use with quick sinus/cosinus look-up
    sinus = (function() {
        var result = new Array(fullCircle);
        for (var i = -1; ++i < fullCircle;) {
            result[i] = sin(i * pi / halfCircle);
        }
        return result;
    })(),
    
    images = [a.createImageData(width, height), a.createImageData(width, height)],
    bufferSize = width * height * 4,
    buffers = [images[0].data, images[1].data],
    
    currentBufferId = 0,
    time = (random() * fullCircle) | 0,
    
    blobR = 255, blobG = 0, blobB = 0,
    blobDR = 0, blobDG = 1, blobDB = 0,
    
    setBlob = function(eventX, eventY, mouse) {
        var ballSize = (eventY * 20 / height) | 0;
        var buffer = buffers[currentBufferId];
        for (var y = -20 ; ++y <= 19;) {
            for (var x = -20; ++x <= 19;) {
                if (y * y + x * x < ballSize * ballSize) {
                    var xx = eventX + x, yy = height - ballSize + y;
                    var offset = (yy * width + xx) * 4;
                    buffer[offset] = mouse ? blobR : blobG;
                    buffer[offset + 1] = mouse ? blobG : blobB;
                    buffer[offset + 2] = mouse ? blobB : blobR;
                    buffer[offset + 3] = 255;
                }
            }
        }
        blobR += blobDR;
        blobG += blobDG;
        blobB += blobDB;
        if (blobG == 255 && blobR == 255) { blobDG = 0; blobDR = -1; }
        if (blobR == 0 && blobB == 0) { blobDR = 0; blobDB = 1; }
        if (blobG == 255 && blobB == 255) { blobDB = 0; blobDG = -1; }
        if (blobR == 0 && blobG == 0) { blobDG = 0; blobDR = 1; }
        if (blobR == 255 && blobB == 255) { blobDR = 0; blobDB = -1; }
        if (blobG == 0 && blobB == 0) { blobDB = 0; blobDG = 1; }
    },
    
    swingX = (width >> 5) + 20, swingXSpeed = 0,
    swingY = height >> 1, swingYSpeed = height >> 4;
    
    for (var i = -1; ++i <= 1;) {
        for (var j = -1; ++j < bufferSize;) {
            buffers[i][j] = 255;
        }
    }
    
    var renderFrame = function() {
        setBlob(swingX, swingY);
        swingX += swingXSpeed >> 3;
         swingY += swingYSpeed >> 2;
        if (swingX > halfWidth) {
            --swingXSpeed;
        } else {
            ++swingXSpeed;
        }
        if (swingY > halfHeight) {
            --swingYSpeed;
        } else {
            ++swingYSpeed;
        }
        var warpedTime = (sinus[time] * fullCircle) | 0;
        a.putImageData(images[currentBufferId], 0, 0);
        var newCurrentBufferId = 1 - currentBufferId;
        for (var y = -1; ++y < height;) {
            for (var x = -1; ++x < width;) {
                var angle = (y * 137 + x * 323 + time + random() * 97) & ffff;
                var distance = 3 * sinus[(y * 273 + x * 189 + time + random() * 31) & ffff];
                distance *= distance;
                var offset = (y * width + x) * 4;
                var fetchY = (y + sinus[angle] * distance + 5) | 0;
                var fetchX = (x + sinus[(angle + quarterSpin) & ffff] * distance) | 0;
                fetchY = min(max(fetchY, 0), height - 1);
                fetchX = min(max(fetchX, 0), width - 1);
                var fetchOffset = (fetchY * width + fetchX) * 4;
                for (var i = -1; ++i < 4;) {
                    buffers[newCurrentBufferId][offset + i] =
                    (
                        buffers[currentBufferId][offset + i] +
                        buffers[currentBufferId][offset + i] +
                        buffers[currentBufferId][offset + i] +
                        buffers[currentBufferId][fetchOffset + i] +
                        (i == 3 ? 0 : 4)
                    ) >> 2;
                }
            }
        }
        
        currentBufferId = newCurrentBufferId;
//        requestAnimationFrame(renderFrame);

        time = (time + 973) & ffff;
    };
    
//    requestAnimationFrame(renderFrame);
    setInterval(renderFrame, 17);
    
    c.onmousemove = function(event) {
        setBlob(event.offsetX, event.offsetY, true);
    }
})();
