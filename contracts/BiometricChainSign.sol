// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BiometricChainSign {
  // signatoryAddress => cid
  mapping(address => string) public signatoryCids;

  // documentHash => signatoryAddress[]
  mapping(string => address[]) public documentSignatories;

  function setSignatoryCid(string memory _cid) public {
    require(bytes(signatoryCids[msg.sender]).length == 0, "Signatory cid already set");
    signatoryCids[msg.sender] = _cid;
  }

  function getSignatoryCid(address _address) public view returns (string memory) {
    return signatoryCids[_address];
  }

  function signDocument(string memory _documentHash) public {
    require(bytes(signatoryCids[msg.sender]).length != 0, "Signatory cid not yet set");

    if (!arrayHasAddress(msg.sender, documentSignatories[_documentHash])) {
      documentSignatories[_documentHash].push(msg.sender);
    }
  }

  function getDocumentSignatories(
    string memory _documentHash
  ) public view returns (address[] memory) {
    return documentSignatories[_documentHash];
  }

  function arrayHasAddress(
    address searchAddress,
    address[] memory addressArray
  ) internal pure returns (bool) {
    for (uint256 i = 0; i < addressArray.length; i++) {
      if (addressArray[i] == searchAddress) {
        // Address found, return true
        return true;
      }
    }
    // Address not found, return false
    return false;
  }
}
