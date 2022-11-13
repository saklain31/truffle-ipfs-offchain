
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract FileTracker {
      struct FileStruct {
        mapping(uint => string) file_hashes_by_version;
        mapping(uint => string) ipfs_digest_by_file_version;
        uint version_count;
        bool reality;
    }

      mapping (address => FileStruct) public files_by_owner;

    //   mapping (address => string[]) public file_hashes_array;



      function storeFileHash(string memory _file_hash) public {
        address user_address = msg.sender;

        if (files_by_owner[user_address].reality == false){
            files_by_owner[user_address].version_count = 0;
            files_by_owner[user_address].reality = true;
        }

        uint current_version = files_by_owner[user_address].version_count;
        files_by_owner[user_address].file_hashes_by_version[current_version] = _file_hash;
        /* files_by_owner[user_address].version_count = current_version+1; */
        /* return current_version; */

    }

    function storeFileIPFSDigest(string memory _ipfs_digest) public {
        address user_address = msg.sender;
        uint _version_no = files_by_owner[user_address].version_count;
        files_by_owner[user_address].ipfs_digest_by_file_version[_version_no] = _ipfs_digest;
        files_by_owner[user_address].version_count = _version_no + 1;
    }

    function getFileHash(uint _version_no) public view returns (string memory) {
       address user_address = msg.sender;
       if(files_by_owner[user_address].reality == false) revert();
       string memory _file_hash = files_by_owner[user_address].file_hashes_by_version[_version_no];
       return _file_hash;
    }

    function getIPFSDigest(uint _version_no) public view returns (string memory) {
        address user_address = msg.sender;
        if(files_by_owner[user_address].reality == false) revert();
        string memory _ipfs_digest = files_by_owner[user_address].ipfs_digest_by_file_version[_version_no];
        return _ipfs_digest;
    }

    function getCurrentVersion() public view returns (uint){
      address user_address = msg.sender;
      uint version_count = files_by_owner[user_address].version_count;
      return version_count-1;
    }
}
