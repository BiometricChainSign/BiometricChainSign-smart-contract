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

  function signDocument(string memory _stampedDocHash, string memory _origDocHash) public {
    require(bytes(signatoryCids[msg.sender]).length != 0, "Signatory cid not yet set");

    Signature memory origDocSig = docSignatures[_origDocHash];

    if (bytes(origDocSig.origDocHash).length == 0 && origDocSig.signatories.length == 0) {
      // neither the original nor the stamped document has been signed yet
      docSignatures[_origDocHash].signatories.push(msg.sender);
      docSignatures[_stampedDocHash].origDocHash = _origDocHash;
      return;
    }

    Signature memory stampedDocSig = docSignatures[_stampedDocHash];

    if (bytes(stampedDocSig.origDocHash).length == 0) {
      // stamped document hasn't been signed yet
      docSignatures[_stampedDocHash].origDocHash = _origDocHash;

      if (!arrayHasAddress(msg.sender, origDocSig.signatories)) {
        docSignatures[_origDocHash].signatories.push(msg.sender);
      }

      return;
    }
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
