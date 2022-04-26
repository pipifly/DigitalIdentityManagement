// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";
import "./Context.sol";
import "./Address.sol";

contract Did is Context, Ownable {

  mapping (bytes32 => bool) public createdVC; // 默认查询createdVC是false
  
  event EventCreateVC(bytes32 sigature);
  event EventRemoveVC(bytes32 signature);

  //bytes32 示例 0x6266dcf4fb72051082c6dd0c266b5bde920edcab9b06b9582170480d0789e62d
  function createVC(bytes32 signature) public onlyOwner {
    require(createdVC[signature] == false, "already created");
    emit EventCreateVC(signature);
    createdVC[signature] = true;

  }

  function removeVC(bytes32 signature) public onlyOwner {
    require(createdVC[signature] == true, "not exist");
    emit EventRemoveVC(signature);
    createdVC[signature] = false;

  }

}