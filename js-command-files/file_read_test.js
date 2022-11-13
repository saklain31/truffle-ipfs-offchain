const { performance } = require('perf_hooks');
// const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

var file_name_array = ['1mb.txt', '2mb.txt', '3mb.txt', '4mb.txt', '5mb.txt', '6mb.txt', '7mb.txt', '8mb.txt', '9mb.txt', '10mb.txt']

module.exports = async function(callback) {

    var start = performance.now()

    //Getting user_address from Global file
    var read_file_module = require('./helper-func/read_txt.js');

    for(let i=0; i<file_name_array.length; i++){
        console.log(file_name_array[i]);
        var file_blocks = read_file_module.splitFileIntoBlocks(file_name_array[i]);
        console.log(file_blocks)
    }

    var end = performance.now()
    console.log("Time took: ", end-start, "ms")

    // var encryption = require('./helper-func/encrypt.js');
    // encryption.encryptFileBlocks();

    callback();
}
