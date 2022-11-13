const { performance } = require('perf_hooks');
var shajs = require('sha.js')

const CloudAudit = artifacts.require("../contracts/CloudAudit.sol");

var arr = ['Cloud','Audit','Data','is','here','###']

var read_file_module = require('./helper-func/read_txt.js');

function storeFileDiffSize(file_name){
    console.log(file_name);
    var file_blocks = read_file_module.splitFileIntoBlocks(file_name);
    return file_blocks
}

var _version_no = 0;
var file_name_index = 0;
var file_name = "1mb.txt";

module.exports = async function(callback) {
    const cloudAudit = await CloudAudit.deployed()

    var encryption = require('./helper-func/encrypt.js');

    var file_blocks = storeFileDiffSize(file_name);
    var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);
    console.log("LENGTH: ", encrypted_file_blocks.length)


    console.log(shajs('sha256').update('42').digest('hex'))
    // var file_hash = await cloudAudit.getFileHash(encrypted_file_blocks);
    // console.log(file_hash);






    // var encryption = require('./helper-func/encrypt.js');
    // var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_blocks);
    // console.log(decrypted_file_blocks)



    // // Encrypting file before storing in the ledger
    // var encryption = require('./helper-func/encrypt.js');
    //
    //
    // var start = performance.now()
    //
    // var file_blocks = storeFileDiffSize(file_name_array[file_name_index]);
    // var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);
    // console.log("LENGTH: ", encrypted_file_blocks.length)
    //
    // // for(var i=0; )
    // var chunkSize = 50;
    // for (var i = 0; i < encrypted_file_blocks.length; i += chunkSize) {
    //     var chunk = encrypted_file_blocks.slice(i, i + chunkSize);
    //     console.log("Chunk: ", chunk);
    //     console.log(await cloudAudit.storeFileBlocksRenew(chunk, _version_no))
    //     // do whatever
    // }
    //
    // var status = await cloudAudit.generateFileHash(_version_no);
    // console.log("Hash: ");
    // console.log(status);


    // var file_hash = await cloudAudit.returnFileHash(_version_no);
    // console.log("file_hash");
    // var chunk = encrypted_file_blocks.slice(0, chunkSize);
    // console.log(await cloudAudit.storeFileBlocksRenew(chunk,0))

    // console.log(await cloudAudit.storeFileBlocks(encrypted_file_blocks))

    // var end = performance.now()
    // console.log(file_hash);
    // console.log("File length", file_blocks.length, "Time took: ", end-start, "ms")

    //
    // for(var i=0; i<file_name_array.length; i++){
    //     var start = performance.now()
    //
    //     var file_blocks = storeFileDiffSize(file_name_array[i]);
    //     var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);
    //     console.log("LENGTH: ", encrypted_file_blocks.length)
    //
    //     console.log(await cloudAudit.storeFileBlocks(encrypted_file_blocks))
    //
    //     var end = performance.now()
    //     console.log("File length", file_blocks.length, "Time took: ", end-start, "ms")
    // }

    // console.log(await cloudAudit.storeFileBlocks(encrypted_file_blocks))
    callback()
}
