// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SignatureContract.sol";

contract MainContract {
    SignatoryContract.Signatory[] public signatories;
    SignatureContract.Signature[] public signatures;
}
