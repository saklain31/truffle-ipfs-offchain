// const FileTracker = artifacts.require("../contracts/FileTracker.sol");
const { performance } = require('perf_hooks');
const fs = require('fs');
const { exec } = require('child_process');

var file_name_array = ['sample2.txt', '1mb.txt', '2mb.txt', '3mb.txt', '4mb.txt', '5mb.txt', '6mb.txt', '7mb.txt', '8mb.txt', '9mb.txt', '10mb.txt']
var txt_file_root = './custom_data_files/';

var encryption = require('../helper-func/encrypt.js');
var read_file_module = require('../helper-func/read_txt.js');

let FILE_BLOCK_SIZE = 64
let ENC_BLOCK_SIZE = 160


// function splitFileIntoBlocks(file_name){
//     try {
//         // var file_path = './custom_data_files/'+file_name;
//         var data = fs.readFileSync(file_name, 'utf8');
//         var raw_data = data.toString()
//         // console.log(raw_data);
//         var file_blocks = read_file_module.stringToChunks(raw_data, FILE_BLOCK_SIZE)
//         // console.log(file_blocks, file_blocks.length)
//         return file_blocks;
//     }
//     catch(e) {
//
//         console.log('Error:', e.stack);
//         return []
//     }
// }


function storeFileDiffSize(file_name){
    console.log(file_name);
    var file_blocks = read_file_module.splitFileIntoBlocks(file_name);
    return file_blocks
}

async function addFileCMD(file_name, callback){
  return exec('ipfs add '+ txt_file_root + file_name, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    return callback(stdout);
  });
}

async function getFileCMD(_digest, callback){
  return exec('ipfs cat ' + _digest, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    return callback(stdout);
  });
}

var digest = 'QmYwRKKHJ9F1oG59zcy2rxmfYCyZCfQYrCG6n22ep6P8ca';


async function writeEncFile(str, file_name){
  fs.writeFileSync(txt_file_root+'enc_'+file_name, str);
}

async function storeEncFileIPFS(file_name, callback){
  return await addFileCMD('enc_'+file_name, function(data) {
    console.log("hash ##", data.split(' ')[1]);
    return callback(data.split(' ')[1]);
  });
}

async function createEncryptedFileIPFS(file_name, callback){
  var _file_blocks = storeFileDiffSize(txt_file_root + file_name);
  var encrypted_file_blocks = encryption.encryptFileBlocks(_file_blocks);
  var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);

  var encrypted_str = encrypted_file_blocks.join('');
  console.log(encrypted_str);
  await writeEncFile(encrypted_str, file_name);
  return storeEncFileIPFS(file_name,
    function(data){
      console.log("2nd ",data);
      return callback(
        {
          'ipfs_hash': data,
          'merkle_root': merkle_root
      });
    });
}



async function getDecryptedFile(_digest){
  var result = getFileCMD(_digest, function(data) {
    // console.log(data);
    // var encrypted_blocks = splitEncFileIntoBlocks();
    var encrypted_file_blocks = read_file_module.stringToChunks(data, ENC_BLOCK_SIZE);
    var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_blocks)
    console.log(decrypted_file_blocks);
  });
}

async function test(){
  // var res = getFileCMD(digest, function(data) {
  //   console.log(data);
  //
  // });
  // console.log("$$$$$$$$$$$$$$$$$$$");
  // res.then(data => {
  //   console.log(data);
  // });
  // console.log(res);
  console.log("*******************")

  await createEncryptedFileIPFS(file_name_array[0], function(res){
    console.log("RREEESS: ", res);
  })


}

module.exports = {
  createEncryptedFileIPFS: createEncryptedFileIPFS,
  // getDecryptedFile: getDecryptedFile,

};
// getDecryptedFile(digest);

// var hash = addFileCMD('sample3.txt');
// console.log("hash",hash);
// getFileCMD(digest);

test();
