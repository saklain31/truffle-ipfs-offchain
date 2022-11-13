var file_blocks = ['Cloud','Audit','Data','is','here','!']

var encryption = require('./encrypt.js');
var encrypted_file_blocks = encryption.encryptFileBlocks(file_blocks);

console.log(encrypted_file_blocks);

var decrypted_file_blocks = encryption.decryptFileBlocks(encrypted_file_blocks);
console.log(decrypted_file_blocks)
