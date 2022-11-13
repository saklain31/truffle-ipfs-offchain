const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

let arr = ['Cloud','Audit','Data','is','here','###']

module.exports = async function(callback) {
    const cloudAudit = await CloudAudit.deployed()

    // Encrypting file before storing in the ledger
    var encryption = require('./helper-func/encrypt.js');
    var encrypted_file_blocks = encryption.encryptFileBlocks(arr);

    console.log(await cloudAudit.storeFileBlocks(encrypted_file_blocks))
    callback()
}
