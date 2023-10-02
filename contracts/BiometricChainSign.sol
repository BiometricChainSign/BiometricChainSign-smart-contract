// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BiometricChainSign {
  struct Signature {
    string origDocHash; // only present if its for a stamped document
    address[] signatories; // only present if its for the original document
  }

  // signatoryAddress => cid
  mapping(address => string) public signatoryCids;

  // documentHash => Signature
  mapping(string => Signature) public docSignatures;

  function setSignatoryCid(string memory _cid) public {
    require(bytes(signatoryCids[msg.sender]).length == 0, "Signatory cid already set");
    signatoryCids[msg.sender] = _cid;
  }

  function getSignatoryCid(address _address) public view returns (string memory) {
    return signatoryCids[_address];
  }

  function signDocument(string memory _stampedDocHash, string memory _parentDocHash) public {
    require(bytes(signatoryCids[msg.sender]).length != 0, "Signatory cid not yet set");

    Signature memory stampedDocSig = docSignatures[_stampedDocHash];

    require(
      bytes(stampedDocSig.origDocHash).length == 0 && stampedDocSig.signatories.length == 0,
      "Stamped document has already been signed"
    );

    Signature memory parentDocSig = docSignatures[_parentDocHash];

    Signature memory origDocSig;
    string memory origDocHash;

    if (bytes(parentDocSig.origDocHash).length > 0) {
      // provided parent document is not the original document
      origDocSig = docSignatures[parentDocSig.origDocHash];
      origDocHash = parentDocSig.origDocHash;
    } else {
      origDocSig = parentDocSig;
      origDocHash = _parentDocHash;
    }

    require(
      !arrayHasAddress(msg.sender, origDocSig.signatories),
      "You have already signed this document"
    );

    docSignatures[origDocHash].signatories.push(msg.sender);
    docSignatures[_stampedDocHash].origDocHash = origDocHash;
  }

  function getDocumentSignatories(string memory _docHash) public view returns (address[] memory) {
    Signature memory sig = docSignatures[_docHash];

    if (bytes(sig.origDocHash).length == 0) {
      return sig.signatories;
    }

    return docSignatures[sig.origDocHash].signatories;
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
