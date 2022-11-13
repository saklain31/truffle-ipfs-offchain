const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

let _version_no = 1;

module.exports = async function(callback) {
    const cloudAudit = await CloudAudit.deployed()

    var addr_module = require('./from-address.js');
    var user_address = addr_module.user_address;

    console.log(await cloudAudit.compareFileHash(user_address, _version_no))
    callback()
}
