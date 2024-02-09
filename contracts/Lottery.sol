// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Lottery {
    address public owner;
    address payable[] public participants;
    uint256 public entryFee;
    uint256 public lotteryEnd;
    bool public lotteryActive;
    address payable public winner;
    uint256 public prizeAmount;

    event ParticipantEntered(address participant);
    event LotteryEnded(address winner, uint256 prizeAmount);
    event PrizeTransferred(bool success, uint256 amount);

    // constructor initialize the contract with entry fee,lottery end time and owner
    constructor(uint256 _entryFeeWei, uint256 _lotteryEnd, uint256 _prizeAmount) {
        owner = msg.sender;
        entryFee = _entryFeeWei;
        lotteryEnd = block.timestamp + _lotteryEnd;
        prizeAmount = _prizeAmount;
        lotteryActive = true;
    }

    // Function for participants to enter the lottery by sending the correct entry fee.
    function participate() public payable {
        require(lotteryActive, "Lottery not active");
        require(msg.value == entryFee, "Incorrect entry fee");
        require(block.timestamp < lotteryEnd, "Lottery has ended");
        participants.push(payable(msg.sender));
    }

    // getter function to get the participants by index for testing purposes
    function getParticipantByIndex(uint256 index) public view returns (address payable) {
        return participants[index];
    }

   //  get the balance of the contract
    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Function to generate a random winner by hashing various parameters.
    function generateRandomWinner() private view returns (address payable) {
        require(msg.sender == owner, "Only the owner can pick a winner");
        require(lotteryActive, "Lottery not active");

        uint index = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, participants.length))) % participants.length;
        return participants[index];
    }

    // Function to end the lottery, select a random winner, and transfer the entire balance of the contract to the winner.
    function endLottery() public {
        require(msg.sender == owner, "Only the owner can end the lottery");
        require(lotteryActive, "Lottery not active");
        require(address(this).balance >= prizeAmount, "Insufficient balance to pay the prize");
        require(participants.length > 0, "No participants in the lottery");

        address payable _winner = generateRandomWinner();
        winner = _winner;
        lotteryActive = false;

        emit LotteryEnded(winner, prizeAmount);

        (bool sent, ) = winner.call{value: prizeAmount}("");
        require(sent, "Failed to send prize");
        emit PrizeTransferred(sent, prizeAmount);
    }

    // Function to start a new lottery with a specified entry fee and duration.
    function startNewLottery(uint256 _entryFee, uint256 _duration, uint256 _prizeAmount) public {
        require(msg.sender == owner, "Only the owner can start a new lottery");
        require(!lotteryActive, "Previous lottery still active");

        entryFee = _entryFee;
        lotteryEnd = block.timestamp + _duration;
        prizeAmount = _prizeAmount;
        delete participants;
        lotteryActive = true;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Allow the contract to receive ETH
    fallback() external payable {}
}