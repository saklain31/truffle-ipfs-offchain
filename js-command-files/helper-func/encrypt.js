// var CryptoJS = require("crypto-js");

const passphrase = "aes-128-ecb";

const AesEncryption = require('aes-encryption')

const aes = new AesEncryption()
aes.setSecretKey('11122233344455566677788822244455555555555555555231231321313aaaff');

const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')

// var text = 'Use the Utf8 encoder';
//
// console.log('text:', text);
// console.log('key:', key);
// console.log('key length:', key.length );
//
// // Use the Utf8 encoder
// text = CryptoJS.enc.Utf8.parse(text);
// // Use the Utf8 encoder (or apply in combination with the hex encoder a 32 hex digit key for AES-128)
// key = CryptoJS.enc.Utf8.parse(key);
//
// // Apply padding (e.g. Zero padding). Note that PKCS#7 padding is more reliable and that ECB is insecure
// var encrypted = CryptoJS.AES.encrypt(text, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });
// encrypted = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
// console.log('encrypted', encrypted);
//
// // Fix: Pass a CipherParams object (or the Base64 encoded ciphertext)
// var decrypted =  CryptoJS.AES.decrypt({ciphertext: CryptoJS.enc.Hex.parse(encrypted)}, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });
//
// // Fix: Utf8 decode the decrypted data
// console.log('decrypted', decrypted.toString(CryptoJS.enc.Utf8));


// function encryptBlock(text){
//     // Use the Utf8 encoder
//     text = CryptoJS.enc.Utf8.parse(text);
//     // Use the Utf8 encoder (or apply in combination with the hex encoder a 32 hex digit key for AES-128)
//     key = CryptoJS.enc.Utf8.parse(key);
//
//     // Apply padding (e.g. Zero padding). Note that PKCS#7 padding is more reliable and that ECB is insecure
//     var encrypted = CryptoJS.AES.encrypt(text, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });
//     encrypted = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
//     console.log('encrypted', encrypted);
//     // decryptBlock(encrypted);
//     return encrypted;
// }

// function encryptBlock(plainText, outputEncoding = "base64") {
//     const cipher = crypto.createCipheriv(phrase, key, null);
//     let encrypted = cipher.update(plainText, 'utf8', outputEncoding)
//     encrypted += cipher.final(outputEncoding);
//     return encrypted;
// }

// function decryptBlock(cipher){
//     // Fix: Pass a CipherParams object (or the Base64 encoded ciphertext)
//     // var cipherParams = CryptoJS.lib.CipherParams.create({
//     //     ciphertext: CryptoJS.enc.Hex.parse(cipher.toString('utf8'))
//     // });
//     //
//     // var decrypted =  CryptoJS.AES.decrypt(cipherParams, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });
//
//     // Fix: Utf8 decode the decrypted data
//     var decrypted =  CryptoJS.AES.decrypt({ciphertext: CryptoJS.enc.Hex.parse(cipher)}, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });
//     console.log('decrypted', decrypted.toString(CryptoJS.enc.Utf8));
//     return decrypted;
// }

// function decryptBlock(cipherText, outputEncoding = "utf8") {
//     const cipher = crypto.createDecipheriv(phrase, key, null);
//     let encrypted = cipher.update(cipherText)
//     encrypted += cipher.final(outputEncoding);
//     return encrypted;
// }


// function encryptBlock(text){
//     var enc_block = CryptoJS.AES.encrypt(text, passphrase).toString();
//     console.log(enc_block);
//     console.log(decryptBlock(enc_block));
//     return enc_block;
// }

function encryptBlock(text){
    const encrypted = aes.encrypt(text);
    return encrypted;

}
// function decryptBlock(ciphertext){
//     try{
//         const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
//         const originalText = bytes.toString(CryptoJS.enc.Utf8);
//         return originalText;
//     }
//
// }

function decryptBlock(ciphertext){
    try{
        return aes.decrypt(ciphertext);
    }
    catch(err){
        return err;
    }

}

function encryptFileBlocks(file_blocks) {
    var encrypted_file_blocks = [];
    for(i=0; i<file_blocks.length; i++){
        encrypted_file_blocks.push(encryptBlock(file_blocks[i]));
    }
    return encrypted_file_blocks;
}


function decryptFileBlocks(file_blocks) {
    // console.log("Encrypted blocks: ", file_blocks);
    var decrypted_file_blocks = [];
    for(i=0; i<file_blocks.length; i++){
        // decrypted_file_blocks.push(decryptBlock(file_blocks[i]));
        // console.log(file_blocks[i], typeof(file_blocks[i]));
        var dec_block = decryptBlock(file_blocks[i]);
        // console.log(dec_block);
        decrypted_file_blocks.push(dec_block);

    }
    return decrypted_file_blocks;
}


function getMerkleRoot(encrypted_blocks){
  const leaves = encrypted_blocks.map(x => SHA256(x))
  const tree = new MerkleTree(leaves, SHA256)
  const root = tree.getRoot().toString('hex');
  return root;
}


//
// var texts = [
//   '49469afb11597508b81a290479a0dd3d',
//   '1652e262ee92a84db6b961736f010263',
//   '8add514927b6186077dd197c4fcf785d'
// ]
//
// decryptFileBlocks(texts);

module.exports = {
  encryptFileBlocks: encryptFileBlocks,
  encryptBlock: encryptBlock,
  decryptFileBlocks: decryptFileBlocks,
  decryptBlock: decryptBlock,
  getMerkleRoot: getMerkleRoot,
};
