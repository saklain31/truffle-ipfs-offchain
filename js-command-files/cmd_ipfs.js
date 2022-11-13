const FileTracker = artifacts.require("../contracts/FileTracker.sol");
const { performance } = require('perf_hooks');
const fs = require('fs');
const { exec } = require('child_process');

const flag = 1;

let FILE_BLOCK_SIZE = 64
let ENC_BLOCK_SIZE = 160


var file_name_array = ['sample3.txt', '1mb.txt', '2mb.txt', '3mb.txt', '4mb.txt', '5mb.txt', '6mb.txt', '7mb.txt', '8mb.txt', '9mb.txt', '10mb.txt']
// var txt_file_root = process.cwd() + '/custom_data_files/';
var txt_file_root = process.cwd() + '/../custom_data_files/';

var encryption = require('./helper-func/encrypt.js');
var read_file_module = require('./helper-func/read_txt.js');
var ipfs_interface = require('./ipfs-module/app.js');
// var ipfs_cmd = require('./ipfs-module/cmd.js');

function storeFileDiffSize(file_name){
    console.log(file_name);
    var file_blocks = splitFileIntoBlocks(file_name);
    return file_blocks
}


function stringToChunks(string, chunkSize) {
    const chunks = [];
    while (string.length > 0) {
        chunks.push(string.substring(0, chunkSize));
        string = string.substring(chunkSize, string.length);
    }
    return chunks
}

function splitFileIntoBlocks(file_path){
    try {
        // var file_path = './custom_data_files/'+file_name;
        var data = fs.readFileSync(file_path, 'utf8');
        var raw_data = data.toString()
        // console.log(raw_data);
        var file_blocks = stringToChunks(raw_data, FILE_BLOCK_SIZE)
        // console.log(file_blocks, file_blocks.length)
        return file_blocks;
    } catch(e) {

        console.log('Error:', e.stack);
        return []
    }
}


async function addFileCMD(file_name, callback){
  console.log("In addFileCMD");
  return await exec('ipfs add '+ txt_file_root + file_name, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(stdout)
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
  console.log("In storeEncFileIPFS");
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






// Save hash to the ledger by calling SC
async function saveHashToSC(file_hash){
  const fileTracker = await FileTracker.deployed();
  console.log(await fileTracker.storeFileHash(file_hash));
  // console.log("Version from SC ", _version_no);
}

async function saveIPFSdigestToSC(digest){
  const fileTracker = await FileTracker.deployed();
  console.log(await fileTracker.storeFileIPFSDigest(digest));
  // console.log("Version from SC ", _version_no);
}

// ############################################################################
//
//
// async function storeInitFile(file_name) {
//
//   var _file_blocks = storeFileDiffSize(file_name);
//   var encrypted_file_blocks = encryption.encryptFileBlocks(_file_blocks);
//   console.log("encrypted_file_blocks",encrypted_file_blocks);
//
//   var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
//
//
//   var result = await ipfs_interface.storeToIPFS(encrypted_file_blocks);
//
//
//
//   console.log("result.path :", result);
//   console.log("Hash: ", merkle_root);
//
//   await saveHashToSC(merkle_root);
//
//   return result.path;
// }
//
// async function storeFileBlockToIPFS(encrypted_file_blocks) {
//   var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
//   var result = await ipfs_interface.storeToIPFS(encrypted_file_blocks);
//   console.log("result.path :", result);
//   console.log("Hash: ", merkle_root);
//   await saveHashToSC(merkle_root);
//   return result.path;
// }
//
// async function getFileHashFromSC(_version_no){
//   const fileTracker = await FileTracker.deployed();
//   var file_hash = await fileTracker.getFileHash(_version_no);
//   return file_hash;
// }
//
// async function getFileIPFSDigestFromSC(_version_no){
//   const fileTracker = await FileTracker.deployed();
//   return await fileTracker.getIPFSDigest(_version_no);
// }
//
// async function challengeForVersion(_version_no){
//   var file_root_hash = await getFileHashFromSC(_version_no);
//   console.log("file_root_hash", file_root_hash);
//   var ipfs_digest = await getFileIPFSDigestFromSC(_version_no);
//   console.log("ipfs_digest", ipfs_digest);
//
//   var enc_file_blocks = await ipfs_interface.getFileByURL(ipfs_digest);
//   // console.log(enc_file_blocks);
//
//   var merkle_root_ipfs_file = encryption.getMerkleRoot(enc_file_blocks);
//
//   if(file_root_hash == merkle_root_ipfs_file){
//     console.log("Challenge Successful!");
//   }
//   else {
//     console.log("Challenge Failed!");
//   }
// }
//
// async function getCurrentVersionFromSC(){
//   const fileTracker = await FileTracker.deployed();
//   var result = await fileTracker.getCurrentVersion();
//   var cur_version = result['words'][0];
//   return cur_version;
//   // console.log("version: ",version);
// }
//
// async function retrieveFile(ipfs_digest) {
//   var enc_file_blocks = await ipfs_interface.getFileByURL(ipfs_digest);
//   var decrypted_file_blocks = encryption.decryptFileBlocks(enc_file_blocks);
//   console.log(decrypted_file_blocks);
// }
//
//
// async function updateFileVersion(_block_index, _new_file_block){
//   var _version_no = await getCurrentVersionFromSC();
//   console.log(_version_no, typeof _version_no);
//   var ipfs_digest = await getFileIPFSDigestFromSC(_version_no);
//   console.log("ipfs_digest ", ipfs_digest);
//   var enc_file_blocks = await ipfs_interface.getFileByURL(ipfs_digest);
//   var enc_new_block = encryption.encryptBlock(_new_file_block);
//   enc_file_blocks[_block_index] = enc_new_block;
//   console.log(enc_file_blocks);
//
//
//   var digest = await storeFileBlockToIPFS(enc_file_blocks);
//   console.log("digest",digest);
//   return digest;
//   // var decrypted_file_blocks = encryption.decryptFileBlocks(enc_file_blocks);
// }
//
// function padding64(str){
//   return str.padEnd(64,"*");
// }
//
//
// async function getFileDigestByVersion(_version_no) {
//   var ipfs_digest = await getFileIPFSDigestFromSC(_version_no);
//   return ipfs_digest;
// }

async function get_test(){
  console.log("*******************")
  console.log("cwd ",process.cwd());
  await createEncryptedFileIPFS(file_name_array[0], function(res){
    console.log("RREEESS: ", res);
  });
}

get_test();



module.exports = async function(callback) {
    const user_input = 24;

    const size_inc = 0;
    const version_no = 0; //4 mb root
    const block_index = 8;

    // 1: Store Init File (file_name)/(encrypted_file_blocks)
    // 2. Challenge File Version (version_no)
    // 3. Get Current Version_no ()
    // 4. Retrieve File (version_no)
    // 5. Update File Version
    // 6. Get file digest by Version

    var start = performance.now();
    if (user_input == 1){
      // Storing File to ipfs
      // Sending hash and digest to SC
      // var start = performance.now()

      // var digest = await storeInitFile(file_name_array[version_no+1+size_inc]);
      // console.log("digest",digest);
      // await saveIPFSdigestToSC(digest);
      // var end = performance.now()
      // process.chdir("..");
      await ipfs_cmd.createEncryptedFileIPFS(file_name_array[0], function(res){
         console.log("%%%%");
         console.log("RREEESS: ", res);
      });

    }
    else if (user_input == 2) {
      // Challenge
      await challengeForVersion(version_no);
    }
    else if (user_input == 3) {
      // Getting Current version
      var result = await getCurrentVersionFromSC();
      console.log(result, typeof result);
    }
    else if (user_input == 4) {
      //Retrieving File
      var file_digest = await getFileIPFSDigestFromSC(version_no);
      await retrieveFile(file_digest);
    }
    else if (user_input == 5) {
      // Update file block
      var new_block = "HEEEEEEEEEELLLLLLLLOOOOOOOO";
      var padded_new_block = padding64(new_block);
      var digest = await updateFileVersion(padded_new_block, new_block);
      console.log("digest",digest);
      await saveIPFSdigestToSC(digest);
    }
    else if (user_input == 6) {
      var ipfs_digest = await getFileDigestByVersion(version_no);
      console.log(ipfs_digest)
    }
    else {
      get_test();
    }



    var end = performance.now();
    console.log("Time took: ", end-start, "ms")

    // callback();



}
