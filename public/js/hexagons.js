function fnDrawAll(aImages, oMap){
    var canvas = document.getElementById('hexmap');

    var hexHeight,
        hexRadius,
        hexRectangleHeight,
        hexRectangleWidth,
        hexagonAngle = 0.523598776, // 30 degrees in radians
        //sideLength = 36,
        sideLength = 54,
        boardWidth = 30,
        boardHeight = 30,
        strokeStyleRegular = "#CCCCCC",
        strokeStyleMarked = "#00CC00",
        //imageHeight = 32,
        //imageWidth = 32,
        imageHeight = sideLength,
        imageWidth = sideLength,
        mTilesByCenter = {},
        aTileCenters = getRevealedCenters(),
        aAllMapSquares = getAllSquares(),
        aRevealedSquares = getRevealedSquares(),
        mObjects = getMapObjects();

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
        drawObjects(mObjects);
        drawPlayers(ctx, boardWidth, boardHeight, oMap.players);
        scrollTo(6, 28);

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
            drawObjects(mObjects);
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
                    drawTile(aImages[4 + mTilesByCenter[i.toString() + "_" + j.toString()]],
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight));
                }
            }
        }
    }

    function drawObjects(objects) {
        for(var key in objects) {
            var obj = objects[key];
            var objPicOffset = obj.picOffset;

            if (objPicOffset) { //has pic
                drawImage(
                    aImages[objPicOffset],
                    obj.x * hexRectangleWidth + ((obj.y % 2) * hexRadius),
                    obj.y * (sideLength + hexHeight),
                    1.5*imageWidth,
                    1.5*imageHeight
                );
            }
        }
    }

    function drawPlayers(canvasContext, width, height, players) {
        for(var i = 0; i < players.length; i++) {
            var playerOffset = findPlayerPicOffset(i);
            var offsetX = playerOffset.offset*(10/playerOffset.total);

            drawImage(aImages[i],
                players[i].square.x * hexRectangleWidth + ((players[i].square.y % 2) * hexRadius) + offsetX,
                players[i].square.y * (sideLength + hexHeight),
                imageWidth,
                imageHeight
            );
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

    function drawImage(img, x, y, sizeX, sizeY) {
        ctx.drawImage(img, x + (hexRectangleWidth-sizeX)/2, y + (hexRectangleHeight - sizeY)/2, sizeX, sizeY);
    }

    function drawTile(tile, x, y) {
        ctx.drawImage(tile, x - hexRectangleWidth, y - 0.75*hexRectangleHeight, 3*hexRectangleWidth, 2.5*hexRectangleHeight);
    }

    function getRevealedCenters() {
        var aResult = [];

        if (oMap) {
            for(var i = 0; i < oMap.centers.length; i++) {
                if (oMap.centers[i].tile !== undefined) {
                    var x = oMap.centers[i].x;
                    var y = oMap.centers[i].y;
                    aResult.push(x.toString() + "_" + y.toString());
                    mTilesByCenter[x.toString() + "_" + y.toString()] = oMap.centers[i].tile;
                }
            }
        }

        return aResult;
    }

    function getRevealedSquares() {
        var aResult = [];

        if (oMap) {
            for(var i = 0; i < oMap.centers.length; i++) {
                if (oMap.centers[i].tile !== undefined) {
                    var x = oMap.centers[i].x;
                    var y = oMap.centers[i].y;
                    aResult = aResult.concat(getSquaresFromCenter(x, y));
                }
            }
        }

        return aResult;
    }

    function getAllSquares() {
        var aResult = [];

        if (oMap) {
            for(var i = 0; i < oMap.centers.length; i++) {
                var x = oMap.centers[i].x;
                var y = oMap.centers[i].y;
                aResult = aResult.concat(getSquaresFromCenter(x, y));
            }
        }

        return aResult;
    }

    function getSquaresFromCenter(x, y) {
        var aResult = [];

        aResult.push(x.toString() + "_" + y.toString());

        if (y % 2) { //odd
            aResult.push((x+1).toString() + "_" + (y-1).toString());
            aResult.push((x+1).toString() + "_" + (y+1).toString());
        } else { //even
            aResult.push((x-1).toString() + "_" + (y-1).toString());
            aResult.push((x-1).toString() + "_" + (y+1).toString());
        }

        aResult.push(x.toString() + "_" + (y-1).toString());
        aResult.push(x.toString() + "_" + (y+1).toString());
        aResult.push((x+1).toString() + "_" + y.toString());
        aResult.push((x-1).toString() + "_" + y.toString());

        return aResult;
    }

    function getMapObjects() {
        var aResult = {};

        if (oMap) {
            for(var i = 0; i < oMap.centers.length; i++) {
                if (oMap.centers[i].tile !== undefined && oMap.objects[oMap.centers[i].tile.toString()]) {
                    var x = oMap.centers[i].x;
                    var y = oMap.centers[i].y;
                    var tileObjects = oMap.objects[oMap.centers[i].tile.toString()];

                    for (var j = 0; j < tileObjects.length; j++) {
                        var obj = tileObjects[j];
                        var objX = x + obj.xOffset;
                        var objY = y + obj.yOffset;


                        if (y % 2 === 0) { //even
                            objX -= 1;
                        }

                        var key = objX.toString() + "_" + objY.toString();

                        aResult[key] = { x: objX, y: objY, objectType: obj.objectType, picOffset: obj.picOffset };
                    }
                }
            }
        }

        return aResult;
    }

    function isCenter(x, y) {
        return aTileCenters.indexOf(x.toString() + "_" + y.toString()) !== -1;
    }

    function isOutside(x, y) {
        return aAllMapSquares.indexOf(x.toString() + "_" + y.toString()) === -1;
    }

    function isRevealed(x, y) {
        return aRevealedSquares.indexOf(x.toString() + "_" + y.toString()) !== -1;
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

    function scrollTo(x, y) {
        var $mapContainer = $('.mapcontainer');
        var height = $mapContainer.innerHeight();
        var width = $mapContainer.innerWidth();

        $mapContainer.scrollLeft((x + 0.5) * hexRectangleWidth + 1.25*((y % 2) * hexRadius) - width/2);
        $mapContainer.scrollTop((y + 0.75) * (sideLength + hexHeight) - height/2);
    }
}