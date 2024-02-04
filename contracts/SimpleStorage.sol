// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

contract SimpleStorage {
    uint256 private _value;

    function set(uint256 value) public {
        _value = value;
    }

    function get() public view returns (uint256) {
        return _value;
    }
}
