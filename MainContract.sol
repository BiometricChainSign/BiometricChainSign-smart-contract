// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MainContract {
  mapping(address => Signatory[]) public signatories;
  Signature[] public signatures;

  function createSignatory(string memory _cid) public {
    Signatory memory signatory = Signatory(msg.sender, _cid);
    signatories[msg.sender].push(signatory);
  }

  struct Signatory {
    address publicAddress;
    string cid;
  }

  struct Signature {
    Signatory[] signatories;
    string documentHash;
  }
}
