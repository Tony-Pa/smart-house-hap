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
