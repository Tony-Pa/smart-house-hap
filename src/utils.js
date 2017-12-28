module.exports.printPincode = function (pc) {
    console.log("Scan this code with your HomeKit App on your iOS device to pair with HAP:");
    console.log("\x1b[30;47m%s\x1b[0m", "                           ");
    console.log("\x1b[30;47m%s\x1b[0m", "                           ");
    console.log("\x1b[30;47m%s\x1b[0m", "      ┌────────────┐       ");
    console.log("\x1b[30;47m%s\x1b[0m", "      │ " + pc + " │       ");
    console.log("\x1b[30;47m%s\x1b[0m", "      └────────────┘       ");
    console.log("\x1b[30;47m%s\x1b[0m", "                           ");
    console.log("\x1b[30;47m%s\x1b[0m", "                           ");
};

exports.HSBtoRGB = function (hsb) {
    let br = Math.round(hsb[2] / 100 * 255);
    if (hsb[1] === 0){
        return [br, br, br];
    } else {
        let hue = hsb[0] % 360;
        let f = hue % 60;
        let p = Math.round((hsb[2] * (100 - hsb[1])) / 10000 * 255);
        let q = Math.round((hsb[2] * (6000 - hsb[1] * f)) / 600000 * 255);
        let t = Math.round((hsb[2] * (6000 - hsb[1] * (60 - f))) / 600000 * 255);
        switch (Math.floor(hue / 60)){
            case 0: return [br, t, p];
            case 1: return [q, br, p];
            case 2: return [p, br, t];
            case 3: return [p, q, br];
            case 4: return [t, p, br];
            case 5: return [br, p, q];
        }
    }
    return [];
};


exports.fixRGB = function (rgb) {
    const maxRed = 255;
    const maxGreen = 170;
    const maxBlue = 128;

    return [
        Math.round(rgb[0] * maxRed / 255),
        Math.round(rgb[1] * maxGreen / 255),
        Math.round(rgb[2] * maxBlue / 255)
    ];
};
