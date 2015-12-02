var aCenters = [];

function generateCenters(iLvl, mostleft, center) {
    aCenters.push(center);

    if (iLvl !== 9) {
        if (mostleft) { //gen up center
            if (center.y % 2) { //odd
                generateCenters(iLvl+1, true, { x: center.x, y: center.y - 3 });
            } else {
                generateCenters(iLvl+1, true, { x: center.x - 1, y: center.y - 3 });
            }
        }

        //gen right center
        generateCenters(iLvl+1, false, { x: center.x + 2, y: center.y - 2 });
    }
}

generateCenters(0, true, { x: 6, y: 28 });

console.log("Count: ", aCenters.length);
console.log(JSON.stringify(aCenters));