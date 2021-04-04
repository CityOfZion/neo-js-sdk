const gen = require("../../webpack.web.umd");

module.exports = (_, argv) => gen(argv.mode, __dirname, "NeonCore");
