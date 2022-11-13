var fs = require('fs');

let FILE_BLOCK_SIZE = 64
let ENC_BLOCK_SIZE = 160

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


function splitEncFileIntoBlocks(file_path){
    try {
        // var file_path = './custom_data_files/'+file_name;
        var data = fs.readFileSync(file_path, 'utf8');
        var raw_data = data.toString()
        // console.log(raw_data);
        var file_blocks = stringToChunks(raw_data, ENC_BLOCK_SIZE)
        // console.log(file_blocks, file_blocks.length)
        return file_blocks;
    } catch(e) {

        console.log('Error:', e.stack);
        return []
    }
}


module.exports = {
  splitFileIntoBlocks: splitFileIntoBlocks,
  stringToChunks: stringToChunks,
  splitEncFileIntoBlocks: splitEncFileIntoBlocks,
};
