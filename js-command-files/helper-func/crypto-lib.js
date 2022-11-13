// const crypto = require("crypto");
//
// const key = Buffer.from("abcdefghijklmnop", "utf8");
// const phrase = "aes-128-ecb";
//
// function encrypt(plainText, outputEncoding = "base64") {
//     const cipher = crypto.createCipheriv(phrase, key, null);
//     let encrypted = cipher.update(plainText, 'utf8', outputEncoding)
//     encrypted += cipher.final(outputEncoding);
//     return encrypted;
// }
//
// function decrypt(cipherText, outputEncoding = "utf8") {
//     const cipher = crypto.createDecipheriv(phrase, key, null);
//     let encrypted = cipher.update(cipherText)
//     encrypted += cipher.final(outputEncoding);
//     return encrypted;
// }
//
//
// console.log("Key length (bits):", key.length * 8);
// const encrypted = encrypt("hello world", "base64");
// console.log("Encrypted string (base64):", encrypted, typeof(encrypted));
//
// // And if we wish to decrypt as well:
// const decrypted = decrypt(Buffer.from(encrypted, "base64"), "utf8")
// console.log("Decrypted string:", decrypted);


/////////////

// var CryptoJS = require("crypto-js");
// var enc = CryptoJS.AES.encrypt("Message", "Secret Passphrase");
// //U2FsdGVkX18ZUVvShFSES21qHsQEqZXMxQ9zgHy+bu0=
// console.log(enc['ciphertext'])
// var dec = CryptoJS.AES.decrypt(enc, "Secret Passphrase");
// //4d657373616765
//
// console.log(dec.toString(CryptoJS.enc.Utf8));

// const CryptoJS = require('crypto-js');
//
// const encryptWithAES = (text) => {
//   const passphrase = '123';
//   return CryptoJS.AES.encrypt(text, passphrase).toString();
// };
//
// const decryptWithAES = (ciphertext) => {
//   const passphrase = '123';
//   const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
//   const originalText = bytes.toString(CryptoJS.enc.Utf8);
//   return originalText;
// };
//
// var enc = encryptWithAES('Hamba!');
//
// console.log(enc);
//
// var dec = decryptWithAES(enc);
// console.log(dec);


/////////////////////////
// crypto module
// const crypto = require("crypto");
//
// const algorithm = "aes-256-cbc";
//
// // generate 16 bytes of random data
// const initVector = crypto.randomBytes(16);
// console.log("initVector: ",initVector, typeof(initVector));
//
// // protected data
// const message = "This is a secret message";
//
// // secret key generate 32 bytes of random data
// const Securitykey = crypto.randomBytes(32);
//
// // the cipher function
// const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
//
// // encrypt the message
// // input encoding
// // output encoding
// let encryptedData = cipher.update(message, "utf-8", "hex");
//
// encryptedData += cipher.final("hex");
//
// console.log("Encrypted message: " + encryptedData);
//
// // the decipher function
// const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
//
// let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
//
// decryptedData += decipher.final("utf8");
//
// console.log("Decrypted message: " + decryptedData);

const AesEncryption = require('aes-encryption')

const aes = new AesEncryption()
aes.setSecretKey('11122233344455566677788822244455555555555555555231231321313aaaff')
// Note: secretKey must be 64 length of only valid HEX characters, 0-9, A, B, C, D, E and F

const encrypted = aes.encrypt('some-plain-text')
const decrypted = aes.decrypt(encrypted)

console.log('encrypted >>>>>>', encrypted, typeof(encrypted))
console.log('decrypted >>>>>>', decrypted, typeof(decrypted))
