// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BiometricChainSign {
  mapping(address => Signatory) public signatories;
  Signature[] public signatures;

  function createSignatory(string memory _cid) public {
    Signatory memory signatory = Signatory(msg.sender, _cid);
    signatories[msg.sender] = signatory;
  }

  function getSignatory(
    address _address
  ) public view returns (Signatory memory) {
    return signatories[_address];
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
