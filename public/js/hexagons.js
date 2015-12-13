var Map = (function() {
    var hexagonAngle = 0.523598776, // 30 degrees in radians
        //sideLength = 36,
        sideLength = 54,
        boardWidth = 30,
        boardHeight = 30,
        hexHeight = Math.sin(hexagonAngle) * sideLength,
        hexRadius = Math.cos(hexagonAngle) * sideLength,
        hexRectangleHeight = sideLength + 2 * hexHeight,
        hexRectangleWidth = 2 * hexRadius,
        StrokeStyle = {
            "Regular": "#CCCCCC",
            "Marked": "#00CC00",
            "Black": "#000000",
            "ActivePlayer": "#FFFF00",
            "ActivePlayerMarked": "#FF0000"
        },
        FillStyle = {
            "Black" : "#000000"
        },
        LineWidth = {
            "Regular": 2,
            "Marked": 3
        };

    function Map(aImages, iActivePlayerIndex) {
        this.aImages = aImages;
        this.iActivePlayerIndex = iActivePlayerIndex;
        this.activePlayerMarked = false;

        this.$mapContainer = $('.mapcontainer');
        this.canvas = document.getElementById('hexmap');
        this.ctx = this.canvas.getContext ? this.canvas.getContext('2d') : null;
        this.canvas.addEventListener("mousedown", handleCanvasMouseDown.bind(this));
    }

    Map.prototype.drawAll = function() {
        this.ctx.fillStyle = FillStyle.Black;
        this.ctx.strokeStyle = StrokeStyle.Regular;
        this.ctx.lineWidth = LineWidth.Regular;

        drawClear.call(this);
        drawBoard.call(this);
        drawObjects.call(this);
        drawPlayers.call(this);
    };

    Map.prototype.update = function(data) {
        this.oMapData = data;

        initRevealedCenters.call(this);
        initAllSquares.call(this);
        initRevealedSquares.call(this);
        initMapObjects.call(this);
        initMapTerrains.call(this);
        //console.log(JSON.stringify(this.mTerrains, '\t'));
    };

    Map.prototype.scrollTo = function(x, y) {
        var height = this.$mapContainer.innerHeight();
        var width = this.$mapContainer.innerWidth();

        this.$mapContainer.scrollLeft((x + 0.5) * hexRectangleWidth + 1.25 * ((y % 2) * hexRadius) - width / 2);
        this.$mapContainer.scrollTop((y + 0.75) * (sideLength + hexHeight) - height / 2);
    };


    Map.prototype.isCenter = function(x, y) {
        return this.aTileCenters.indexOf(x.toString() + "_" + y.toString()) !== -1;
    };

    Map.prototype.isOutside = function(x, y) {
        return this.aAllMapSquares.indexOf(x.toString() + "_" + y.toString()) === -1;
    };

    Map.prototype.isRevealed = function(x, y) {
        return this.aRevealedSquares.indexOf(x.toString() + "_" + y.toString()) !== -1;
    };

    Map.prototype.isActivePlayer = function(x, y) {
        return this.oMapData.players[this.iActivePlayerIndex].square.x === x
                && this.oMapData.players[this.iActivePlayerIndex].square.y === y;
    };

    Map.prototype.isSquareNextToSqaure = function(x1, y1, x2, y2) {
        var aSquares = getSquaresFromCenter.call(this, x1, y1);
        return aSquares.indexOf(x2.toString() + "_" + y2.toString()) !== -1;
    };

    Map.prototype.isSquareNextToActivePlayer = function(x, y) {
        return this.isSquareNextToSqaure(
            this.oMapData.players[this.iActivePlayerIndex].square.x,
            this.oMapData.players[this.iActivePlayerIndex].square.y,
            x,
            y
        );
    };

    Map.prototype.getMovePointsFromSquare = function(x, y) {
        var key = x.toString() + "_" + y.toString();
        if (this.mTerrains[key]) {
            return this.mTerrains[key].move;
        } else {
            return 1000;
        }
    };

    function initRevealedCenters() {
        this.aTileCenters = [];
        this.mTilesByCenter = {};

        if (this.oMapData) {
            for (var i = 0; i < this.oMapData.centers.length; i++) {
                if (this.oMapData.centers[i].tile !== undefined) {
                    var x = this.oMapData.centers[i].x;
                    var y = this.oMapData.centers[i].y;
                    this.aTileCenters.push(x.toString() + "_" + y.toString());
                    this.mTilesByCenter[x.toString() + "_" + y.toString()] = this.oMapData.centers[i].tile;
                }
            }
        }
    }

    function initRevealedSquares() {
        this.aRevealedSquares = [];

        if (this.oMapData) {
            for (var i = 0; i < this.oMapData.centers.length; i++) {
                if (this.oMapData.centers[i].tile !== undefined) {
                    var x = this.oMapData.centers[i].x;
                    var y = this.oMapData.centers[i].y;
                    this.aRevealedSquares = this.aRevealedSquares.concat(getSquaresFromCenter(x, y));
                }
            }
        }
    }

    function initAllSquares() {
        this.aAllMapSquares = [];

        if (this.oMapData) {
            for (var i = 0; i < this.oMapData.centers.length; i++) {
                var x = this.oMapData.centers[i].x;
                var y = this.oMapData.centers[i].y;
                this.aAllMapSquares = this.aAllMapSquares.concat(getSquaresFromCenter(x, y));
            }
        }
    }

    function initMapObjects() {
        this.mObjects = {};

        if (this.oMapData) {
            for (var i = 0; i < this.oMapData.centers.length; i++) {
                if (this.oMapData.centers[i].tile !== undefined && this.oMapData.objects[this.oMapData.centers[i].tile.toString()]) {
                    var x = this.oMapData.centers[i].x;
                    var y = this.oMapData.centers[i].y;
                    var tileObjects = this.oMapData.objects[this.oMapData.centers[i].tile.toString()];

                    for (var j = 0; j < tileObjects.length; j++) {
                        var obj = tileObjects[j];
                        var objX = x + obj.xOffset;
                        var objY = y + obj.yOffset;


                        if (y % 2 === 0 && obj.yOffset !== 0) { //even centers
                            objX -= 1;
                        }

                        var key = objX.toString() + "_" + objY.toString();

                        this.mObjects[key] = {x: objX, y: objY, objectType: obj.objectType, picOffset: obj.picOffset};
                    }
                }
            }
        }
    }

    function initMapTerrains() {
        this.mTerrains = {};

        if (this.oMapData) {
            for (var i = 0; i < this.oMapData.centers.length; i++) {
                if (this.oMapData.centers[i].tile !== undefined && this.oMapData.squares[this.oMapData.centers[i].tile.toString()]) {
                    var x = this.oMapData.centers[i].x;
                    var y = this.oMapData.centers[i].y;
                    var tileTerrains = this.oMapData.squares[this.oMapData.centers[i].tile.toString()];

                    for (var j = 0; j < tileTerrains.length; j++) {
                        var obj = tileTerrains[j];
                        var objX = x + obj.xOffset;
                        var objY = y + obj.yOffset;

                        if (y % 2 === 0 && obj.yOffset !== 0) { //even centers
                            objX -= 1;
                        }

                        var key = objX.toString() + "_" + objY.toString();

                        this.mTerrains[key] = { x: objX, y: objY, terrain: obj.terrain, move: getMovePointsFromTerrain.call(this, obj.terrain) };
                    }
                }
            }
        }
    }

    function getMovePointsFromTerrain(sTerrain) {
        switch (sTerrain) {
            case "plain":
                return 2;
            case "water":
                return 1000;
            case "forest":
                return 3;
            case "hill":
                return 3;
            default:
                return 5;
        }
    }

    function getSquaresFromCenter(x, y) {
        var aResult = [];

        aResult.push(x.toString() + "_" + y.toString());

        if (y % 2) { //odd
            aResult.push((x + 1).toString() + "_" + (y - 1).toString());
            aResult.push((x + 1).toString() + "_" + (y + 1).toString());
        } else { //even
            aResult.push((x - 1).toString() + "_" + (y - 1).toString());
            aResult.push((x - 1).toString() + "_" + (y + 1).toString());
        }

        aResult.push(x.toString() + "_" + (y - 1).toString());
        aResult.push(x.toString() + "_" + (y + 1).toString());
        aResult.push((x + 1).toString() + "_" + y.toString());
        aResult.push((x - 1).toString() + "_" + y.toString());

        return aResult;
    }

    function findPlayerPicOffset(iPlayerIndex) {
        var squareTotalPlayers = 0,
            offset = 0;

        for (var i = 0; i < this.oMapData.players.length; i++) {
            if (this.oMapData.players[i].square.x === this.oMapData.players[iPlayerIndex].square.x
                && this.oMapData.players[i].square.y === this.oMapData.players[iPlayerIndex].square.y) {
                squareTotalPlayers++;

                if (i < iPlayerIndex) {
                    offset++;
                } else if (i > iPlayerIndex) {
                    offset--;
                }
            }
        }

        return {total: squareTotalPlayers, offset: offset};
    }

    //need context - bind or call to pass the this instance

    function handleCanvasMouseDown(eventInfo) {
        var x = eventInfo.offsetX || eventInfo.layerX,
            y = eventInfo.offsetY || eventInfo.layerY,
            hexY = Math.floor(y / (hexHeight + sideLength)),
            hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth),
            screenX = hexX * hexRectangleWidth + ((hexY % 2) * hexRadius),
            screenY = hexY * (hexHeight + sideLength),
            strokeStyle = StrokeStyle.Marked;

        //alert(hexX + " " + hexY);

        // Check if the mouse's coords are on the board
        if (hexX >= 0 && hexX < boardWidth && hexY >= 0 && hexY < boardHeight) {
            this.drawAll();

            if (this.isActivePlayer(hexX, hexY)) {
                this.activePlayerMarked = !this.activePlayerMarked;

                if (this.activePlayerMarked) {
                    strokeStyle = StrokeStyle.ActivePlayerMarked;
                }
            }

            drawHexagon.call(this, screenX, screenY, strokeStyle, LineWidth.Marked);

            if (!this.isActivePlayer(hexX, hexY)) {
                if (this.activePlayerMarked && this.isSquareNextToActivePlayer(hexX, hexY)) {
                    this.$mapContainer.trigger( "requestmove", { x: hexX, y: hexY, pointsNeeded: this.getMovePointsFromSquare(hexX, hexY) });
                }

                this.activePlayerMarked = false;
            }
        }
    }

    function drawClear() {
        this.ctx.fillStyle = FillStyle.Black;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    function drawBoard() {
        var i,
            j;

        for (i = 0; i < boardWidth; ++i) {
            for (j = 0; j < boardHeight; ++j) {
                if (this.isOutside(i, j)) {
                    drawBlackHexagon.call(
                        this,
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight),
                        false
                    );
                } else if (!this.isRevealed(i, j)) {
                    drawBlackHexagon.call(
                        this,
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight),
                        true
                    );
                }

                if (this.oMapData && !this.isOutside(i, j) && !this.isRevealed(i, j)) {
                    drawHexagon.call(
                        this,
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight),
                        StrokeStyle.Regular,
                        LineWidth.Regular
                    );
                }

                if (this.isCenter(i, j)) {
                    drawTile.call(
                        this,
                        this.aImages[4 + this.mTilesByCenter[i.toString() + "_" + j.toString()]],
                        i * hexRectangleWidth + ((j % 2) * hexRadius),
                        j * (sideLength + hexHeight));
                }
            }
        }
    }

    function drawObjects() {
        for (var key in this.mObjects) {
            var obj = this.mObjects[key];
            var objPicOffset = obj.picOffset;

            if (objPicOffset) { //has pic
                drawImage.call(
                    this,
                    this.aImages[objPicOffset],
                    obj.x * hexRectangleWidth + ((obj.y % 2) * hexRadius),
                    obj.y * (sideLength + hexHeight),
                    1.5 * sideLength,
                    1.5 * sideLength
                );
            }
        }
    }

    function drawPlayers() {
        for (var i = 0; i < this.oMapData.players.length; i++) {
            var playerOffset = findPlayerPicOffset.call(this, i),
                offsetX = playerOffset.offset * (10 / playerOffset.total);

            drawImage.call(
                this,
                this.aImages[i],
                this.oMapData.players[i].square.x * hexRectangleWidth + ((this.oMapData.players[i].square.y % 2) * hexRadius) + offsetX,
                this.oMapData.players[i].square.y * (sideLength + hexHeight),
                sideLength,
                sideLength
            );

            if (i === this.iActivePlayerIndex) {
                var x = this.oMapData.players[i].square.x,
                    y = this.oMapData.players[i].square.y,
                    screenX = x * hexRectangleWidth + ((y % 2) * hexRadius),
                    screenY = y * (sideLength + hexHeight);

                drawHexagon.call(
                    this,
                    screenX,
                    screenY,
                    StrokeStyle.ActivePlayer,
                    LineWidth.Marked
                );
            }
        }
    }

    function drawHexagon(x, y, strokeStyle, lineWidth) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + hexRadius, y);
        this.ctx.lineTo(x + hexRectangleWidth, y + hexHeight);
        this.ctx.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        this.ctx.lineTo(x + hexRadius, y + hexRectangleHeight);
        this.ctx.lineTo(x, y + sideLength + hexHeight);
        this.ctx.lineTo(x, y + hexHeight);
        this.ctx.closePath();

        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
    }

    function drawBlackHexagon(x, y, stroke) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + hexRadius, y);
        this.ctx.lineTo(x + hexRectangleWidth, y + hexHeight);
        this.ctx.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        this.ctx.lineTo(x + hexRadius, y + hexRectangleHeight);
        this.ctx.lineTo(x, y + sideLength + hexHeight);
        this.ctx.lineTo(x, y + hexHeight);
        this.ctx.closePath();

        this.ctx.strokeStyle = StrokeStyle.Black;
        this.ctx.lineWidth = LineWidth.Regular;
        this.ctx.fill();

        if (stroke) {
            this.ctx.strokeStyle = StrokeStyle.Regular;
            this.ctx.stroke();
        }
    }

    function drawImage(img, x, y, sizeX, sizeY) {
        this.ctx.drawImage(img, x + (hexRectangleWidth - sizeX) / 2, y + (hexRectangleHeight - sizeY) / 2, sizeX, sizeY);
    }

    function drawTile(tile, x, y) {
        this.ctx.drawImage(tile, x - hexRectangleWidth, y - 0.75 * hexRectangleHeight, 3 * hexRectangleWidth, 2.5 * hexRectangleHeight);
    }

    return Map;
})();