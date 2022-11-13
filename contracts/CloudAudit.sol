// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract CloudAudit {
    struct FileStruct {
        uint file_id_global; //public auditing purpose
        /* mapping(uint => uint[]) version_to_chunk_count; */
        mapping(uint => string[]) mapped_file_blocks;
        uint version_count; //
        bool reality;
    }

    mapping (address => FileStruct) public files_by_owner;
    mapping (address => bytes32[]) public file_hashes_by_owner;

    // Check if the user exits
    function userExists(address userAddress) public view returns(bool) {
        return files_by_owner[userAddress].reality;
        /* if(files_by_owner[userAddress].reality){
            return true;
        }
        else{
            return false;
        } */
    }

    // Allocate space for the user at the first time
    function initCloudForUser() public returns(bool success) {
        address userAddress = msg.sender;
        if(userExists(userAddress)) revert();
        files_by_owner[userAddress].version_count = 0;
        files_by_owner[userAddress].reality = true;
        return true;
    }

    // Store an array of file blocks for an user (first time)
    function storeFileBlocks(string[] memory _file_blocks) public returns(bool){
        address userAddress = msg.sender;
        if(!userExists(userAddress)) revert();

        uint temp_version = files_by_owner[userAddress].version_count;


        files_by_owner[userAddress].mapped_file_blocks[temp_version] = _file_blocks;

        bytes32 file_hash = getFileHash(_file_blocks);
        file_hashes_by_owner[userAddress].push(file_hash);

        temp_version += 1;
        files_by_owner[userAddress].version_count = temp_version;
        return true;
    }


    // Store an array of file blocks for an user (first time)
    function storeFileBlocksRenew(string[] memory _file_blocks, uint _version_no) public returns(bool){
        address userAddress = msg.sender;
        if(!userExists(userAddress)) revert();

        /* uint temp_version = files_by_owner[userAddress].version_count; */

        for (uint256 i = 0; i < _file_blocks.length; i++) {
            files_by_owner[userAddress].mapped_file_blocks[_version_no].push(_file_blocks[i]);
            /* return true; */
        }

        /* files_by_owner[userAddress].mapped_file_blocks[_version_no].push(_file_blocks); */

        /* bytes32 file_hash = getFileHash(_file_blocks); */
        /* file_hashes_by_owner[userAddress].push(file_hash); */

        /* temp_version += 1; */
        /* files_by_owner[userAddress].version_count = temp_version; */
        return true;
    }

    // Retrive a file by version number
    function getFileVersionForOwner(uint _version_no) public view returns (string[] memory){
        address userAddress = msg.sender;
        if(!userExists(userAddress)) revert();

        if(_version_no >= files_by_owner[userAddress].version_count) revert();
        return files_by_owner[userAddress].mapped_file_blocks[_version_no];
    }

    function getFileVersionForOwnerRenew(address user_address, uint _version_no) public view returns (string[] memory){
        address userAddress = user_address;//msg.sender;
        /* if(!userExists(userAddress)) revert(); */

        /* if(_version_no >= files_by_owner[userAddress].version_count) revert(); */
        return files_by_owner[userAddress].mapped_file_blocks[_version_no];
    }


    // Update a file block and create a new version
    function updateBlockByIdx(uint _block_idx, string memory new_block) public returns (bool){
        address userAddress = msg.sender;
        if(!userExists(userAddress)) revert();

        uint last_version_no = files_by_owner[userAddress].version_count - 1;
        if(last_version_no >= files_by_owner[userAddress].version_count) revert();
        if(files_by_owner[userAddress].mapped_file_blocks[last_version_no].length <= _block_idx) revert();

        files_by_owner[userAddress].mapped_file_blocks[last_version_no+1] = files_by_owner[userAddress].mapped_file_blocks[last_version_no];
        files_by_owner[userAddress].mapped_file_blocks[last_version_no+1][_block_idx] = new_block;

        bytes32 file_hash = getFileHash(files_by_owner[userAddress].mapped_file_blocks[last_version_no+1]);
        file_hashes_by_owner[userAddress].push(file_hash);

        files_by_owner[userAddress].version_count += 1;

        return true;
    }


    function updateBlockByIdxRenew(uint _block_idx, string memory new_block, uint _version_no) public returns (bool){
        address userAddress = msg.sender;
        if(!userExists(userAddress)) revert();

        uint last_version_no = _version_no; //files_by_owner[userAddress].version_count - 1;
        /* if(last_version_no >= files_by_owner[userAddress].version_count) revert(); */
        if(files_by_owner[userAddress].mapped_file_blocks[last_version_no].length <= _block_idx) revert();

        bool flag;
        //Out of Gas
        for (uint256 i = 0; i < files_by_owner[userAddress].mapped_file_blocks[last_version_no].length; i++) {
            flag = copyBlockToNextVersion(userAddress, last_version_no, i);
        }
        /* files_by_owner[userAddress].mapped_file_blocks[last_version_no+1] = files_by_owner[userAddress].mapped_file_blocks[last_version_no]; */



        files_by_owner[userAddress].mapped_file_blocks[last_version_no+1][_block_idx] = new_block;

        /* bytes32 file_hash = getFileHash(files_by_owner[userAddress].mapped_file_blocks[last_version_no+1]);
        file_hashes_by_owner[userAddress].push(file_hash);

        files_by_owner[userAddress].version_count += 1; */

        return true;
    }

    function copyBlockToNextVersion(address user_address, uint _cur_version_no, uint _block_idx) internal returns (bool){
        files_by_owner[user_address].mapped_file_blocks[_cur_version_no+1][_block_idx] = files_by_owner[user_address].mapped_file_blocks[_cur_version_no][_block_idx];
        return true;
    }


    // Calculate hash for all concatenated blocks in a file
    function getFileHash(string[] memory _file_blocks) public pure returns (bytes32) {
        string memory file_string = concatBlocks(_file_blocks);
        bytes32 file_hash = keccak256(abi.encodePacked(file_string));
        // file_hashes_by_owner[msg.sender].push(file_hash);
        // idx += 1;
        return file_hash;

    }

    function returnFileHash(uint _version_no) public view returns (bytes32) {
        address userAddress = msg.sender;
        bytes32 file_hash = file_hashes_by_owner[userAddress][_version_no];
        return file_hash;
    }

    function generateFileHash(uint _version_no) public returns (bool){
        address userAddress = msg.sender;
        bytes32 file_hash = getFileHash(files_by_owner[userAddress].mapped_file_blocks[_version_no]);
        file_hashes_by_owner[userAddress][_version_no] = file_hash;
        return true;
    }


    /* function generateFileHash(string[] memory _file_blocks) public pure returns (bytes32) {
        string memory file_string = concatBlocks(_file_blocks);
        bytes32 file_hash = keccak256(abi.encodePacked(file_string));
        // file_hashes_by_owner[msg.sender].push(file_hash);
        // idx += 1;
        return file_hash;
    } */

    // Concate elements of a string array
    function concatBlocks(string[] memory _file_blocks) internal pure returns (string memory) {
        bytes memory output;
        for (uint256 i = 0; i < _file_blocks.length; i++) {
            output = abi.encodePacked(output, _file_blocks[i]);
        }
        return string(output);
    }

    // function hash(string memory _string) public pure returns(bytes32) {
    //     return keccak256(abi.encodePacked(_string));
    // }

    // What if only the hash is saved???
    function compareFileHash(address _file_owner, uint _version_no) public view returns (bool) {
        // address userAddress = msg.sender;
        // if(!userExists(userAddress)) revert();
        address userAddress = _file_owner;
        if(_version_no > files_by_owner[userAddress].version_count) revert();

        bytes32 file_hash = getFileHash(files_by_owner[userAddress].mapped_file_blocks[_version_no]);
        if(file_hashes_by_owner[userAddress][_version_no] == file_hash) {
            return true;
        }
        else {
            return false;
        }
    }
}
