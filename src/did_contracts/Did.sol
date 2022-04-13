// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Address.sol";
import "./Ownable.sol";
import "./Context.sol";
import "./Address.sol";

contract Did is Context, Ownable {


  function createVC(bytes signature) external onlyOwner {

  }


}