const FileTracker = artifacts.require("../contracts/FileTracker.sol");
const { performance } = require('perf_hooks');
const fs = require('fs');
const { exec } = require('child_process');

const flag = 1;



var file_name_array = ['sample3.txt', '1mb.txt', '2mb.txt', '3mb.txt', '4mb.txt', '5mb.txt', '6mb.txt', '7mb.txt', '8mb.txt', '9mb.txt', '10mb.txt']
var txt_file_root = './custom_data_files/';

var encryption = require('./helper-func/encrypt.js');
var read_file_module = require('./helper-func/read_txt.js');
var ipfs_interface = require('./ipfs-module/app.js');

function storeFileDiffSize(file_name){
    console.log(file_name);
    var file_blocks = read_file_module.splitFileIntoBlocks(txt_file_root + file_name);
    return file_blocks
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



async function storeInitFile(file_name) {

  var _file_blocks = storeFileDiffSize(file_name);
  var encrypted_file_blocks = encryption.encryptFileBlocks(_file_blocks);
  console.log("encrypted_file_blocks",encrypted_file_blocks);

  var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
  var result = await ipfs_interface.storeToIPFS(encrypted_file_blocks);

  console.log("result.path :", result);
  console.log("Hash: ", merkle_root);

  await saveHashToSC(merkle_root);

  return result.path;
}

async function storeFileBlockToIPFS(encrypted_file_blocks) {
  var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
  var result = await ipfs_interface.storeToIPFS(encrypted_file_blocks);
  console.log("result.path :", result);
  console.log("Hash: ", merkle_root);
  await saveHashToSC(merkle_root);
  return result.path;
}

async function getFileHashFromSC(_version_no){
  const fileTracker = await FileTracker.deployed();
  var file_hash = await fileTracker.getFileHash(_version_no);
  return file_hash;
}

async function getFileIPFSDigestFromSC(_version_no){
  const fileTracker = await FileTracker.deployed();
  return await fileTracker.getIPFSDigest(_version_no);
}

async function challengeForVersion(_version_no){
  var file_root_hash = await getFileHashFromSC(_version_no);
  console.log("file_root_hash", file_root_hash);
  var ipfs_digest = await getFileIPFSDigestFromSC(_version_no);
  console.log("ipfs_digest", ipfs_digest);

  var enc_file_blocks = await ipfs_interface.getFileByURL(ipfs_digest);
  // console.log(enc_file_blocks);

  var merkle_root_ipfs_file = encryption.getMerkleRoot(enc_file_blocks);

  if(file_root_hash == merkle_root_ipfs_file){
    console.log("Challenge Successful!");
  }
  else {
    console.log("Challenge Failed!");
  }
}

async function getCurrentVersionFromSC(){
  const fileTracker = await FileTracker.deployed();
  var result = await fileTracker.getCurrentVersion();
  var cur_version = result['words'][0];
  return cur_version;
  // console.log("version: ",version);
}

async function retrieveFile(ipfs_digest) {
  var enc_file_blocks = await ipfs_interface.getFileByURL(ipfs_digest);
  var decrypted_file_blocks = encryption.decryptFileBlocks(enc_file_blocks);
  console.log(decrypted_file_blocks);
}


async function updateFileVersion(_block_index, _new_file_block){
  var _version_no = await getCurrentVersionFromSC();
  console.log(_version_no, typeof _version_no);
  var ipfs_digest = await getFileIPFSDigestFromSC(_version_no);
  console.log("ipfs_digest ", ipfs_digest);
  var enc_file_blocks = await ipfs_interface.getFileByURL(ipfs_digest);
  var enc_new_block = encryption.encryptBlock(_new_file_block);
  enc_file_blocks[_block_index] = enc_new_block;
  console.log(enc_file_blocks);


  var digest = await storeFileBlockToIPFS(enc_file_blocks);
  console.log("digest",digest);
  return digest;
  // var decrypted_file_blocks = encryption.decryptFileBlocks(enc_file_blocks);
}

function padding64(str){
  return str.padEnd(64,"*");
}


async function getFileDigestByVersion(_version_no) {
  var ipfs_digest = await getFileIPFSDigestFromSC(_version_no);
  return ipfs_digest;
}

//
// const IPFS = require('ipfs-core');
// //
//
// async function addFile(){
//   const ipfs = await IPFS.create()
//   const { cid } = await ipfs.add('Hello world')
//   console.info(cid)
// }

function addFileTest() {
  var ipfsAPI = require('ipfs-api');
  var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');

  // console.log(ipfs);
  // console.log(ipfs.util);
  // console.log("aaa");

  // var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');

// txt_file_root + "enc_sample3.txt"
ipfs.util.addFromFs(, { recursive: true , ignore: ['subfolder/to/ignore/**']}, (a) => {
    // if (err){
    //     console.log(err);
    //     throw err;
    // }

    console.log(a);
    // return result;
    });

}



// // addFile()
// function resolveAfter2Seconds() {
//   return new Promise(resolve => {"
//     setTimeout(() => {
//       resolve('resolved');
//     }, 2000);
//   });
// }
//
// async function asyncCall() {
//   console.log('calling');
//   var result = await resolveAfter2Seconds();
//   console.log("result", result);
//   // expected output: 'resolved'
// }
//

// async function testRun()


module.exports = async function(callback) {
    const user_input = 41;

    const size_inc = 0;
    const version_no = 0;
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

      var digest = await storeInitFile(file_name_array[6]);
      console.log("digest",digest);
      await saveIPFSdigestToSC(digest);
      // var end = performance.now()

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

        addFileTest();
        // console.log(add);
        // await asyncCall();
    }

    var end = performance.now();
    console.log("Time took: ", end-start, "ms")

    callback();

    // var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
    // console.log("Hash: ", merkle_root);
    //
    // const fileTracker = await FileTracker.deployed();
    // var _version_no = await fileTracker.storeFileHash(merkle_root);
    // console.log("Version from SC ", _version_no);



    // console.log("merkle_root", _merkle_root);

}




















//
// function padding(block_array){
//   // try{
//   if(block_array.length > 0){
//     var len = block_array[0].length;
//     if(block_array[len-1].length < len){
//       var last_block = block_array[len-1];
//       var new_last_block = last_block.rjust(len, ' ');
//       block_array[len-1] = new_last_block;
//       return block_array;
//     }
//   }
//   else{
//     return [];
//   }
//   // }
//   // catch(e){
//   //   console.log(e);
//   //   return [];
//   // }
// }
//
// async function storeInitialFile(file_name){
//     var file_blocks = storeFileDiffSize(file_name);
//     var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);
//     // encrypted_file_blocks = padding(encrypted_file_blocks);
//     // console.log(encrypted_file_blocks);
//     // var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
//     // console.log("Hash: ", merkle_root);
//     return writeEncryptedBlocksToFile(file_name, encrypted_file_blocks);
//
//     // var ipfs_digest = await ipfs_interface.storeFileToIPFS(txt_file_root + file_name);
//     // console.log("IPFS digest: ", ipfs_digest.path);
//     // return ipfs_digest.path;
// }
//
//
// var file_hash = "QmPN93Hm3oYM5Z2uh3ZKrSEXdypUh8RxtYCUmhv98VBgHT";
//
// // async function getFileFromIPFS(file_hash){
// //     var start = performance.now();
// //     var response = await ipfs_interface.getFileByURL(file_hash);
// //     console.log(response);
// //     var end = performance.now();
// //     console.log("Time took: ", end-start, "ms")
// // }
//
//
// async function sendHashToSC(encrypted_file_blocks) {
//   var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
//   console.log("Hash: ", merkle_root);
//
//   const fileTracker = await FileTracker.deployed();
//   var _version_no = await fileTracker.storeFileHash(merkle_root);
//   console.log("Version from SC ", _version_no);
//
// }
//
// function writeEncryptedBlocksToFile(file_name, encrypted_blocks){
//   var encrypted_string = encrypted_blocks.join('')
//   console.log(encrypted_string);
//
//   // fs.writeFileSync("../custom_data_files/"+'enc_'+file_name, encrypted_string);
//   var file = fs.createWriteStream('custom_data_files/enc_'+file_name);
//   file.on('error', function(err) {
//     /* error handling */
//   });
//   file.write(encrypted_string);
//   file.end();
//
//   exec('ipfs add custom_data_files/enc_'+file_name, (err, stdout, stderr) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     var digest = stdout.split(' ')[1];
//     console.log('stdout:', digest, typeof(stdout));
//     console.log('stderr:', stderr);
//
//     this.sendHashToSC(encrypted_file_blocks);
//     // return digest;
//   });
// }



// function readEncryptedFile(file_name) {
//   var file_blocks = read_file_module.splitEncFileIntoBlocks(txt_file_root + file_name);
//   var decrypted_file_blocks = encryption.decryptFileBlocks(file_blocks);
//   // console.log(decrypted_file_blocks);
//
//   return file_blocks
// }
//
// var file_name = file_name_array[0];
// var file_blocks = storeFileDiffSize(file_name);
// var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);

// writeEncryptedBlocksToFile(file_name, encrypted_file_blocks);
// readEncryptedFile('enc_sample3.txt');





// file_hash =
// storeInitialFile(file_name_array[2]);
// getFileFromIPFS(file_hash);
