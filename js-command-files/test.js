

var txt_file_root = process.cwd() + '/custom_data_files/';

// async function addFileTest() {
//   var ipfsAPI = require('ipfs-api');
// // or connect with multiaddr
//   // const files = [{
//   // path: '/tmp/myfile.txt',
//   // content: 'ABC'
//   // }]
//
//   var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');
//   //
//   await ipfs.util.addFromFs(txt_file_root + "enc_sample3.txt", { recursive: true , ignore: ['subfolder/to/ignore/**']}, (err, result) => {
//     if (err) {
//       console.log(err);
//       throw err;
//   }
//   console.log(result);
//   })
// }

const fs = require('fs');
const { exec } = require('child_process');


var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');

async function addFileTest2() {
  // var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');
  //
  ipfs.util.addFromFs(txt_file_root + "enc_sample3.txt", { recursive: true , ignore: ['subfolder/to/ignore/**']}, async(err, result) => {
  if (err) {
      console.log(err);
      throw err;
  }
  console.log(result);
  // return result;
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

async function getFileByDigest(_digest) {
  const chunks = []
  _digest = '/ipfs/'+_digest;
  console.log(_digest);
  for await (const chunk of ipfs.get(_digest, { recursive: true , ignore: ['subfolder/to/ignore/**']})){
    chunks.push(chunk)
  }
  console.log(Buffer.concat(chunks).toString())
}


var digest = "QmSVEbjFfCm8dZPqCVyfi885RxaRwJVE5KoJu8eHcsygnY";

// addFileTest2()
// getFileByDigest(digest);
getFileCMD(digest, function(res){
   console.log("%%%%");
   console.log("RREEESS: ", res);
});
