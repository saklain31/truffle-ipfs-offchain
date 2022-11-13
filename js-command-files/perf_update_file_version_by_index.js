const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

let _block_idx = 2
let _new_block = "NewBlock"
let _cur_version_no = 1;

module.exports = async function(callback) {
    const cloudAudit = await CloudAudit.deployed()

    var encryption = require('./helper-func/encrypt.js');
    var encrypted_file_block = encryption.encryptBlock(_new_block);


    console.log(await cloudAudit.updateBlockByIdxRenew(_block_idx, encrypted_file_block, _cur_version_no))
    callback()
}
