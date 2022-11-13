const { create } =  require('ipfs-http-client');

const projectId = "2FXIVg3NwW45KkbYZq2zJTJBZ6m";
const projectSecret = "fa1c4350ae4405ec9c0cf8bffc49c49b";

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const read_file_module = require('../helper-func/read_txt.js');
const encryption = require('../helper-func/encrypt.js');

var addr_module = require('../from-address.js');
var ipfs_root_url = addr_module.ipfs_root_url;


var file_name_array = ['sample2.txt', '1mb.txt', '2mb.txt', '3mb.txt', '4mb.txt', '5mb.txt', '6mb.txt', '7mb.txt', '8mb.txt', '9mb.txt', '10mb.txt']

// Split File of any size into File Blocks of specific length
function storeFileDiffSize(file_name){
    console.log(file_name);
    var file_blocks = read_file_module.splitFileIntoBlocks(file_name);
    return file_blocks
}


// Create Client Instance to access IPFS Network [Infura]
async function ipfsClient() {
  const ipfs = await create(
    {
      host:"ipfs.infura.io", //"ipfs.io",  //"209.94.90.1", "localhost"
      port: 5001,
      protocol: "https",
      headers: {
        authorization: auth,
      },
    }
  );
  return ipfs;
}

// Store File Blocks (Encrypted) in IPFS and gets a Digest as unique id
async function storeToIPFS(file_blocks){
  let ipfs = await ipfsClient();
  var json_blocks = JSON.stringify(file_blocks);
  let result = await ipfs.add(file_blocks);
  console.log(result);
  return result;
}

// const file_root = "../custom_data_files/";
//
// function storeFileToIPFS(file_path){
//   var file_blocks = storeFileDiffSize(file_path);
//   console.log(file_blocks);
//   var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);
//   console.log("encrypted_file_blocks",encrypted_file_blocks);
//   var result = storeToIPFS(encrypted_file_blocks);
//   return result;
//   // console.log("LENGTH: ", encrypted_file_blocks[0].length);
// }


//From a file, Store Encrypted Blocks in IPFS
function storeFileToIPFS(file_path){
  var file_blocks = storeFileDiffSize(file_path);
  console.log(file_blocks);
  var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);
  console.log("encrypted_file_blocks",encrypted_file_blocks);
  var result = storeToIPFS(encrypted_file_blocks);
  return encrypted_file_blocks, result;
  // console.log("LENGTH: ", encrypted_file_blocks[0].length);
}

//
// function storeEncryptedBlocksTest(file_blocks){
//   // var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);
//   // console.log(encrypted_file_blocks);
//   var result = storeToIPFS(file_blocks);
//   console.log(result);
//   console.log("LENGTH: ", file_blocks.length)
//
// }


// Retrieve file from IPFS by unique digest
async function getFilebyHash(ipfs, file_hash){
  var result = await ipfs.get(file_hash);
  return result;
}


// Create client to get file from IPFS by unique digest
async function getFilebyHashIPFS(file_hash){
  let ipfs = await ipfsClient();
  var result = getFilebyHash(ipfs, file_hash);
  console.log(result, typeof result);
  return result;
}

const axios = require('axios');
const file_hash = "QmQT3WmdYNNFTV2n7saP2nab5YdVcCTKR5bF6HfyWWEJNL";

var encrypt_block_chunksize = 160;


// API request to IPFS cluster to get the encrypted file blocks
async function getFileByURL(file_hash) {
  const hash_url = ipfs_root_url + file_hash;
  return axios.get(hash_url)
    .then(response => {
        var result = response.data;
        var encrypted_file_chunks = read_file_module.stringToChunks(result,encrypt_block_chunksize);
        // var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_chunks);
        return Promise.resolve(encrypted_file_chunks);
    })
    .catch(error => {
      console.log(error);
      return Promise.resolve({'err': error});
  });
}



// async function getEncFileByURL(file_hash) {
//   const hash_url = ipfs_root_url + file_hash;
//   return axios.get(hash_url)
//     .then(response => {
//         var result = response.data;
//         return Promise.resolve(result);
//         // var encrypted_file_chunks = read_file_module.stringToChunks(result,encrypt_block_chunksize);
//         // var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_chunks);
//         return Promise.resolve(decrypted_file_blocks);
//     })
//     .catch(error => {
//       console.log(error);
//       return Promise.resolve({'err': error});
//   });
// }




// getFileByURL(file_hash).then(data => {console.log(data)});



module.exports = {
  getFileByURL: getFileByURL,
  storeFileToIPFS: storeFileToIPFS,
  storeToIPFS: storeToIPFS,
};
