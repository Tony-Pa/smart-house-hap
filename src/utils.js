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

module.exports.HSVtoRGB = function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
};
