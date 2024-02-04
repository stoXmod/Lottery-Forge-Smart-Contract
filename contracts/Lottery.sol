// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Lottery {
    address public owner;
    address payable[] public participants;
    uint256 public entryFee;
    uint256 public lotteryEnd;
    bool public lotteryActive;

    // constructor initialize the contract with entry fee,lottery end time and owner
    constructor(uint256 _entryFee, uint256 _lotteryEnd) {
        owner = msg.sender;
        entryFee = _entryFee;
        lotteryEnd = block.timestamp + _lotteryEnd;
        lotteryActive = true;
    }

    // Function for participants to enter the lottery by sending the correct entry fee.
    function participate() public payable {
        require(lotteryActive, "Lottery not active");
        require(msg.value == entryFee, "Incorrect entry fee");
        require(block.timestamp < lotteryEnd, "Lottery has ended");
        participants.push(payable(msg.sender));
    }

    // Function to generate a random winner by hashing various parameters.
    function generateRandomWinner() private view returns (address payable) {
        require(msg.sender == owner, "Only the owner can pick a winner");
        require(lotteryActive, "Lottery not active");
        require(block.timestamp >= lotteryEnd, "Lottery still ongoing");

        uint index = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, participants.length))) % participants.length;
        return participants[index];
    }

    // Function to end the lottery, select a random winner, and transfer the entire balance of the contract to the winner.
    function endLottery() public {
        require(msg.sender == owner, "Only the owner can end the lottery");
        require(lotteryActive, "Lottery not active");
        require(block.timestamp >= lotteryEnd, "Lottery still ongoing");

        address payable winner = generateRandomWinner();
        winner.transfer(address(this).balance);
        lotteryActive = false;
    }

    // Function to start a new lottery with a specified entry fee and duration.
    function startNewLottery(uint256 _entryFee, uint256 _duration) public {
        require(msg.sender == owner, "Only the owner can start a new lottery");
        require(!lotteryActive, "Previous lottery still active");

        entryFee = _entryFee;
        lotteryEnd = block.timestamp + _duration;
        delete participants;
        lotteryActive = true;
    }
}