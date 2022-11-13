const FileTracker = artifacts.require("../contracts/FileTracker.sol");

const { performance } = require('perf_hooks');
const fs = require('fs');
const { exec } = require('child_process');

const flag = 1;

var file_name_array = ['sample3.txt', '1mb.txt', '2mb.txt', '3mb.txt', '4mb.txt', '5mb.txt', '6mb.txt', '7mb.txt', '8mb.txt', '9mb.txt', '10mb.txt']
// var txt_file_root = './custom_data_files/';
var txt_file_root = '../custom_data_files/';


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



async function storeInitFile(file_name, callback) {
  var start = performance.now();
  var _file_blocks = storeFileDiffSize(file_name);
  var encrypted_file_blocks = encryption.encryptFileBlocks(_file_blocks);
  console.log("encrypted_file_blocks",encrypted_file_blocks);

  var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
  console.log("Merkle Root: ", merkle_root);
  var result = await ipfs_interface.storeToIPFS(encrypted_file_blocks);
  console.log("result.path :", result);

  await saveHashToSC(merkle_root);
  await saveIPFSdigestToSC(result.path);


  var end = performance.now();
  console.log("Time took: ", end-start, "ms")

  // callback();
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


var encrypt_block_chunksize = 160;

async function challengeForVersion(_version_no){
  var start = performance.now();
  var file_root_hash = await getFileHashFromSC(_version_no);
  console.log("file_root_hash", file_root_hash);
  var ipfs_digest = await getFileIPFSDigestFromSC(_version_no);
  console.log("ipfs_digest", ipfs_digest);

  var data = await getFileCMD(ipfs_digest, function(res){
     console.log("Encrypted File");
     console.log(res);
     var encrypted_file_chunks = read_file_module.stringToChunks(res ,encrypt_block_chunksize);
     var merkle_root_ipfs_file = encryption.getMerkleRoot(encrypted_file_chunks);
     if(file_root_hash == merkle_root_ipfs_file){
       console.log("Challenge Successful!");
     }
     else {
       console.log("Challenge Failed!");
     }
     var end = performance.now();
     console.log("Time took: ", end-start, "ms")
  });

}

async function getCurrentVersionFromSC(){
  const fileTracker = await FileTracker.deployed();
  var result = await fileTracker.getCurrentVersion();
  console.log(result);
  var cur_version = result['words'][0];
  return cur_version;
  // console.log("version: ",version);
}

async function retrieveFile(ipfs_digest) {
  var enc_file_blocks = await ipfs_interface.getFileByURL(ipfs_digest);
  var decrypted_file_blocks = encryption.decryptFileBlocks(enc_file_blocks);
  console.log(decrypted_file_blocks);
}


async function updateFileVersion(_block_index, _new_file_block, callback){

  var start = performance.now();
  var _version_no = await getCurrentVersionFromSC();
  console.log(_version_no, typeof _version_no);
  var ipfs_digest = await getFileIPFSDigestFromSC(_version_no);
  console.log("ipfs_digest ", ipfs_digest);


  var data = await getFileCMD(ipfs_digest, async function(res){
     console.log("Encrypted File");
     console.log(res);
     var encrypted_file_chunks = read_file_module.stringToChunks(res ,encrypt_block_chunksize);
     var merkle_root_ipfs_file = encryption.getMerkleRoot(encrypted_file_chunks);

     var enc_new_block = encryption.encryptBlock(_new_file_block);
     encrypted_file_chunks[_block_index] = enc_new_block;
     console.log(encrypted_file_chunks);

     var digest = await storeFileBlockToIPFS(encrypted_file_chunks);
     console.log("digest",digest);

     await saveHashToSC(merkle_root_ipfs_file);
     await saveIPFSdigestToSC(digest);
     var end = performance.now();
     console.log("Time took: ", end-start, "ms")
     callback();
     return digest;
  });
}


  // var enc_file_blocks = await ipfs_interface.getFileByURL(ipfs_digest);
  // var enc_new_block = encryption.encryptBlock(_new_file_block);
  // enc_file_blocks[_block_index] = enc_new_block;
  // console.log(enc_file_blocks);
  //
  //
  // var digest = await storeFileBlockToIPFS(enc_file_blocks);
  // console.log("digest",digest);
  // return digest;
  // // var decrypted_file_blocks = encryption.decryptFileBlocks(enc_file_blocks);


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


var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');


async function addFileTest(file_name, callback) {
  var start = performance.now();

  var _file_blocks = storeFileDiffSize(file_name);
  var encrypted_file_blocks = encryption.encryptFileBlocks(_file_blocks);
  console.log("encrypted_file_blocks",encrypted_file_blocks);

  var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
  console.log(merkle_root);

    // txt_file_root + "enc_sample3.txt"
  return await ipfs.util.addFromFs(txt_file_root + "enc_sample3.txt", { recursive: true , ignore: ['subfolder/to/ignore/**']}, async (err, result) => {
    // if (err){
    //     console.log(err);
    //     throw err;
    // }
    await saveHashToSC(merkle_root);

    console.log("Res", result[0].hash);
    var end = performance.now();

    await saveIPFSdigestToSC(result[0].hash);

    console.log("Time took: ", end-start, "ms");
    callback();

  });
  // callback();
}


async function getFileByDigest(_digest) {
  const chunks = []
  _digest = '/ipfs/'+_digest;
  console.log(_digest);
  for await (const chunk of ipfs.get(_digest, { recursive: true , ignore: ['subfolder/to/ignore/**']})){
    chunks.push(chunk)
  }
  console.log(Buffer.concat(chunks).toString())
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

async function retrieveFileIPFS(version_no){
  var start = performance.now();
  var file_digest = await getFileIPFSDigestFromSC(version_no);
  console.log("file_digest: ",file_digest);
  // await retrieveFile(file_digest);
  var data = await getFileCMD(file_digest, function(res){
     console.log("%%%%");
     console.log(res);
     var encrypted_file_chunks = read_file_module.stringToChunks(res ,encrypt_block_chunksize);
     var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_chunks);
     console.log(decrypted_file_blocks);

     var end = performance.now();
     console.log("Time took: ", end-start, "ms");
  });
}



async function getFileCMD(_digest, callback){
  return exec('ipfs cat ' + _digest, {maxBuffer: 1024 * 500 * 500}, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    return callback(stdout);
  });
}


module.exports = async function(callback) {
    const user_input = 4;

    const size_inc = 0;
    const version_no = 3;
    const block_index = 5;

    // 1: Store Init File (file_name)/(encrypted_file_blocks)
    // 2. Challenge File Version (version_no)
    // 3. Get Current Version_no ()
    // 4. Retrieve File (version_no)
    // 5. Update File Version
    // 6. Get file digest by Version

    var digest = "QmSVEbjFfCm8dZPqCVyfi885RxaRwJVE5KoJu8eHcsygnY";
    var start = performance.now();
    if (user_input == 1){
      // Storing File to ipfs
      // Sending hash and digest to SC
      // var start = performance.now()

      var digest = await storeInitFile(file_name_array[1], callback);
      console.log("digest",digest);
      callback();

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
      await retrieveFileIPFS(version_no);
      // var file_digest = await getFileIPFSDigestFromSC(version_no);
      // console.log("file_digest: ",file_digest);
      // // await retrieveFile(file_digest);
      // var data = await getFileCMD(file_digest, function(res){
      //    console.log("%%%%");
      //    console.log(res);
      //    var encrypted_file_chunks = read_file_module.stringToChunks(res ,encrypt_block_chunksize);
      //    var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_chunks);
      //    console.log(decrypted_file_blocks);
      // });
      // console.log(data);
      // stringToChunks(raw_data, ENC_BLOCK_SIZE)

    }
    else if (user_input == 5) {
      // Update file block
      var new_block = "HEEEEEEEEEELLLLLLLLOOOOOOOO";
      var padded_new_block = padding64(new_block);
      var digest = await updateFileVersion(padded_new_block, new_block, callback);
      console.log("digest in main:",digest);
      // await saveIPFSdigestToSC(digest);
    }
    else if (user_input == 6) {
      var ipfs_digest = await getFileDigestByVersion(version_no);
      console.log(ipfs_digest)
    }
    else if(user_input == 7){
      await getFileByDigest(digest);
    }
    else if(user_input == 8){
      await getFileCMD(digest, callback);
    }
    else {

        var temp = await addFileTest(file_name_array[4], callback);
        console.log(temp);
        // await asyncCall();
        // await saveHashToSC("SSSSSSSSS");
        // await saveIPFSdigestToSC("sssss");
        // var end = performance.now();
        // console.log("Time took: ", end-start, "ms")
        // callback();
    }

    var end = performance.now();
    console.log("Time took: ", end-start, "ms")

    // await callback();

    // var merkle_root = encryption.getMerkleRoot(encrypted_file_blocks);
    // console.log("Hash: ", merkle_root);
    //
    // const fileTracker = await FileTracker.deployed();
    // var _version_no = await fileTracker.storeFileHash(merkle_root);
    // console.log("Version from SC ", _version_no);



    // console.log("merkle_root", _merkle_root);

}
