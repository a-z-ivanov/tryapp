function fnDrawAll(aImages){
    var canvas = document.getElementById('hexmap');

    var hexHeight,
        hexRadius,
        hexRectangleHeight,
        hexRectangleWidth,
        hexagonAngle = 0.523598776, // 30 degrees in radians
        sideLength = 36,
        boardWidth = 10,
        boardHeight = 10,
        strokeStyleRegular = "#CCCCCC",
        strokeStyleMarked = "#00CC00",
        imageHeight = 32,
        imageWidth = 32;

    hexHeight = Math.sin(hexagonAngle) * sideLength;
    hexRadius = Math.cos(hexagonAngle) * sideLength;
    hexRectangleHeight = sideLength + 2 * hexHeight;
    hexRectangleWidth = 2 * hexRadius;

    if (canvas.getContext){
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = "#000000";
        ctx.strokeStyle = strokeStyleRegular;
        ctx.lineWidth = 1;

        drawBoard(ctx, boardWidth, boardHeight);

        canvas.addEventListener("mousedown", function(eventInfo) {
            var x,
                y,
                hexX,
                hexY,
                screenX,
                screenY;

            x = eventInfo.offsetX || eventInfo.layerX;
            y = eventInfo.offsetY || eventInfo.layerY;

            
            hexY = Math.floor(y / (hexHeight + sideLength));
            hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);

            screenX = hexX * hexRectangleWidth + ((hexY % 2) * hexRadius);
            screenY = hexY * (hexHeight + sideLength);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawBoard(ctx, boardWidth, boardHeight);

            // Check if the mouse's coords are on the board
            if(hexX >= 0 && hexX < boardWidth) {
                if(hexY >= 0 && hexY < boardHeight) {
                    ctx.fillStyle = "#000000";
                    drawHexagon(ctx, screenX, screenY, true);
                }
            }
        });
    }

    function drawBoard(canvasContext, width, height) {
        var i,
            j;

        var imageId = 0;

        for(i = 0; i < width; ++i) {
            for(j = 0; j < height; ++j) {
                drawHexagon(
                    ctx, 
                    i * hexRectangleWidth + ((j % 2) * hexRadius), 
                    j * (sideLength + hexHeight), 
                    false,
                    imageId
                );
                imageId++;
            }
        }
    }

    function drawHexagon(canvasContext, x, y, fill, imageId) {
        var fill = fill || false;

        canvasContext.beginPath();
        canvasContext.moveTo(x + hexRadius, y);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
        canvasContext.lineTo(x, y + sideLength + hexHeight);
        canvasContext.lineTo(x, y + hexHeight);
        canvasContext.closePath();

        if(fill) {
            ctx.strokeStyle = strokeStyleMarked;
            ctx.lineWidth = 3;
            //canvasContext.fill();
            canvasContext.stroke();
        } else {
            ctx.strokeStyle = strokeStyleRegular;
            ctx.lineWidth = 1;
            canvasContext.stroke();
            drawImage(aImages[imageId%4], canvasContext, x, y);
        }
    }

    function drawImage(img, canvasContext, x, y, fill) {
        ctx.drawImage(img, x + (hexRectangleWidth-imageWidth)/2, y + (hexRectangleHeight - imageHeight)/2);
        //ctx.beginPath();
        //ctx.moveTo(30,96);
        //ctx.lineTo(70,66);
        //ctx.lineTo(103,76);
        //ctx.lineTo(170,15);
        //ctx.stroke();
    }
}