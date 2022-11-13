const CloudAudit = artifacts.require("CloudAudit");

module.exports = function (deployer) {
   deployer.deploy(CloudAudit);
};
