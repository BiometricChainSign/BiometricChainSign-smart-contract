// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "SignatoryContract.sol";

contract SignatureContract {
    struct Signature {
        SignatoryContract.Signatory[] signatories;
        string document_hash;
    }
}
