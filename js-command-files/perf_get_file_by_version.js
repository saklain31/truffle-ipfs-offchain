const { performance } = require('perf_hooks');
const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

let _version_no = 0;

module.exports = async function(callback) {
    const cloudAudit = await CloudAudit.deployed();




    console.log("??????????????????????????");

    var start = performance.now()

    var addr_module = require('./from-address.js');
    var user_address = addr_module.user_address;



    var encrypted_file_blocks = await cloudAudit.getFileVersionForOwnerRenew(user_address, _version_no);
    console.log(encrypted_file_blocks, typeof(encrypted_file_blocks[0]));

    // Encrypting file before storing in the ledger
    var encryption = require('./helper-func/encrypt.js');
    var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_blocks);
    console.log(decrypted_file_blocks)

    var end = performance.now()
    console.log("File length", decrypted_file_blocks.length, "Time took: ", end-start, "ms")

    callback()
}
