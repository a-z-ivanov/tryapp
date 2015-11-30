function fnDrawAll(aImages, oMap){
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
        imageWidth = 32,
        iCurrentTile = 0,
        aTileCenters = getCenters(),
        aAllMapSquares = getAllSquares(),
        aRevealedSquares = getRevealedSquares();

    hexHeight = Math.sin(hexagonAngle) * sideLength;
    hexRadius = Math.cos(hexagonAngle) * sideLength;
    hexRectangleHeight = sideLength + 2 * hexHeight;
    hexRectangleWidth = 2 * hexRadius;

    if (canvas.getContext){
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = "#000000";
        ctx.strokeStyle = strokeStyleRegular;
        ctx.lineWidth = 2;

        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawBoard(ctx, boardWidth, boardHeight);
        drawPlayers(ctx, boardWidth, boardHeight, oMap.players);

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

            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawBoard(ctx, boardWidth, boardHeight);
            drawPlayers(ctx, boardWidth, boardHeight, oMap.players);

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

        iCurrentTile = 0;

        for(i = 0; i < width; ++i) {
            for(j = 0; j < height; ++j) {
                if (isOutside(i, j)) {
                    drawBlackHexagon(ctx,
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight),
                        false
                    );
                } else if (!isRevealed(i, j)) {
                    drawBlackHexagon(ctx,
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight),
                        true
                    );
                }

                if (!isOutside(i, j) && (oMap && !isRevealed(i, j))) {
                    drawHexagon(
                        ctx,
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight),
                        false
                    );
                }

                if (isCenter(i, j)) {
                    drawTile(aImages[4 + iCurrentTile++],
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight));
                }
            }
        }
    }

    function drawPlayers(canvasContext, width, height, players) {
        for(var i = 0; i < players.length; i++) {
            var playerOffset = findPlayerPicOffset(i);
            var offsetX = playerOffset.offset*(10/playerOffset.total);

            //drawImage(aImages[11 + i],
            drawImage(aImages[i],
                players[i].square.x * hexRectangleWidth + ((players[i].square.y % 2) * hexRadius) + offsetX,
                players[i].square.y * (sideLength + hexHeight));
        }
    }

    function drawHexagon(canvasContext, x, y, stroke) {
        var stroke = stroke || false;

        canvasContext.beginPath();
        canvasContext.moveTo(x + hexRadius, y);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
        canvasContext.lineTo(x, y + sideLength + hexHeight);
        canvasContext.lineTo(x, y + hexHeight);
        canvasContext.closePath();

        if(stroke) {
            ctx.strokeStyle = strokeStyleMarked;
            ctx.lineWidth = 3;
            canvasContext.stroke();
        } else {
            ctx.strokeStyle = strokeStyleRegular;
            ctx.lineWidth = 2;
            canvasContext.stroke();
        }
    }

    function drawBlackHexagon(canvasContext, x, y, stroke) {
        canvasContext.beginPath();
        canvasContext.moveTo(x + hexRadius, y);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
        canvasContext.lineTo(x, y + sideLength + hexHeight);
        canvasContext.lineTo(x, y + hexHeight);
        canvasContext.closePath();

        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        canvasContext.fill();

        if (stroke) {
            ctx.strokeStyle = strokeStyleRegular;
            ctx.lineWidth = 2;
            canvasContext.stroke();
        }
    }

    function drawImage(img, x, y) {
        ctx.drawImage(img, x + (hexRectangleWidth-imageWidth)/2, y + (hexRectangleHeight - imageHeight)/2);
    }

    function drawTile(tile, x, y) {
        ctx.drawImage(tile, x - hexRectangleWidth, y - 0.75*hexRectangleHeight, 3*hexRectangleWidth, 2.5*hexRectangleHeight);
    }

    function getCenters() {
        var aResult = [];

        if (oMap) {
            for (var i = 0; i < oMap.groups.length; i++) {
                for (var j = 0; j < oMap.groups[i].squares.length; j++) {
                    if (oMap.groups[i].revealed && oMap.groups[i].squares[j].center) {
                        aResult.push(oMap.groups[i].squares[j].id);
                    }
                }
            }
        }

        return aResult;
    }

    function getRevealedSquares() {
        var aResult = [];

        if (oMap) {
            for (var i = 0; i < oMap.groups.length; i++) {
                for (var j = 0; j < oMap.groups[i].squares.length; j++) {
                    if (oMap.groups[i].revealed) {
                        aResult.push(oMap.groups[i].squares[j].id);
                    }
                }
            }
        }

        return aResult;
    }

    function getAllSquares() {
        var aResult = [];

        if (oMap) {
            for (var i = 0; i < oMap.groups.length; i++) {
                for (var j = 0; j < oMap.groups[i].squares.length; j++) {
                    aResult.push(oMap.groups[i].squares[j].id);
                }
            }
        }

        return aResult;
    }

    function isCenter(x, y) {
        return aTileCenters.indexOf(x.toString() + y.toString()) !== -1;
    }

    function isOutside(x, y) {
        return aAllMapSquares.indexOf(x.toString() + y.toString()) === -1;
    }

    function isRevealed(x, y) {
        return aRevealedSquares.indexOf(x.toString() + y.toString()) !== -1;
    }

    function findPlayerPicOffset(player) {
        var squareTotalPlayers = 0,
            offset = 0;

        for(var i = 0; i < oMap.players.length; i++) {
            if (oMap.players[i].square.x === oMap.players[player].square.x && oMap.players[i].square.y === oMap.players[player].square.y) {
                squareTotalPlayers++;

                if (i < player) {
                    offset++;
                } else if (i > player) {
                    offset--;
                }
            }
        }

        return { total: squareTotalPlayers, offset: offset };
    }
}