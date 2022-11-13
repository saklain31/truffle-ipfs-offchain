const FileTracker = artifacts.require("FileTracker");

module.exports = function (deployer) {
   deployer.deploy(FileTracker);
};
