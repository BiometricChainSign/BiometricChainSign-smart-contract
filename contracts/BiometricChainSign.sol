// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BiometricChainSign {
  mapping(address => Signatory) public signatories;

  // documentHash => signatoryAddress[]
  mapping(string => address[]) public signatures;

  function createSignatory(string memory _cid) public {
    Signatory memory signatory = Signatory(msg.sender, _cid);
    signatories[msg.sender] = signatory;
  }

  function getSignatory(address _address) public view returns (Signatory memory) {
    return signatories[_address];
  }

  function addSignature(string memory _documentHash) public {
    Signatory memory signatory = signatories[msg.sender];

    require(bytes(signatory.cid).length != 0, "Signatory not found");

    if (!arrayHasAddress(msg.sender, signatures[_documentHash])) {
      signatures[_documentHash].push(msg.sender);
    }
  }

  function getSignatureSignatories(
    string memory _documentHash
  ) public view returns (address[] memory) {
    return signatures[_documentHash];
  }

  function arrayHasAddress(
    address searchAddress,
    address[] memory addressArray
  ) private pure returns (bool) {
    for (uint256 i = 0; i < addressArray.length; i++) {
      if (addressArray[i] == searchAddress) {
        // Address found, return true
        return true;
      }
    }
    // Address not found, return false
    return false;
  }

  struct Signatory {
    address publicAddress;
    string cid;
  }
}
