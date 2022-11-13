const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

module.exports = async function(callback) {
    const cloudAudit = await CloudAudit.deployed()
    console.log(await cloudAudit.initCloudForUser())
    callback()
}
