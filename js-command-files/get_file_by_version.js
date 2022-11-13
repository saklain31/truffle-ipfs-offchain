const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

let _version_no = 0;

module.exports = async function(callback) {
    const cloudAudit = await CloudAudit.deployed();
    var encrypted_file_blocks = await cloudAudit.getFileVersionForOwner(_version_no);
    console.log(encrypted_file_blocks, typeof(encrypted_file_blocks[0]));

    // Encrypting file before storing in the ledger
    var encryption = require('./helper-func/encrypt.js');
    var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_blocks);
    console.log(decrypted_file_blocks);

    callback()
}
