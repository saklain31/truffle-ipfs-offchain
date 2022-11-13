const { performance } = require('perf_hooks');
const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

var file_name_array = ['1mb.txt']

module.exports = async function(callback) {

    var start = performance.now()


    //Getting user_address from Global file
    var addr_module = require('./from-address.js');
    var user_address = addr_module.user_address;

    const cloudAudit = await CloudAudit.deployed()
    var status = await cloudAudit.userExists(user_address)
    console.log(status)

    var end = performance.now()
    console.log("Time took: ", end-start, "ms")

    // var read_file_module = require('./helper-func/read_txt.js');
    // var file_blocks = read_file_module.splitFileIntoBlocks(file_name_array[0]);
    // console.log(file_blocks)

    // var encryption = require('./helper-func/encrypt.js');
    // encryption.encryptFileBlocks();

    callback();
}
