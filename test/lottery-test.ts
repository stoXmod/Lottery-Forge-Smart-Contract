import {ethers} from 'hardhat';
import {expect} from 'chai';
import {Contract} from "ethers";

describe('Lottery Contract', function () {
    const entryFeeInEther = "0.01";
    const entryFeeInWei = ethers.utils.parseEther(entryFeeInEther);
    let lottery: Contract;
    let owner: any;
    this.timeout(40000)

    before(async function (){
        const LotteryFactory = await ethers.getContractFactory('Lottery');
        lottery = await LotteryFactory.deploy(entryFeeInWei, 3600);
        // Deploy the contract
        await lottery.deployed();
        // Get the owner's address
        [owner] = await ethers.getSigners();
        console.log('🚀 Owner address:', owner.address);
    });

    it('should initialize the contract with correct values', async () => {
        // Check if the owner is correctly set
        expect(await lottery.owner()).to.equal(owner.address);
        // Check if the entry fee is correctly set
        expect((await lottery.entryFee()).toString()).to.equal(entryFeeInWei.toString());
        // Check if the lottery is initially active
        expect(await lottery.lotteryActive()).to.equal(true);
    })

    it('should allow participants to enter the lottery', async () => {
        // Participate in the lottery
        const tx = await lottery.connect(owner).participate({ value: entryFeeInWei });
        await tx.wait()
        // Check if the participant is added to the participants array
        const participants = await lottery.getParticipantByIndex(0);
        console.log(participants)
        expect(participants).to.equal(owner.address);
    })

    it('should not allow entry after lottery has ended', async () => {
        // Move to a time after the lottery end
        await ethers.provider.send('evm_increaseTime', [3601]); // Assuming 1 hour duration, adjust as needed

        // Try to participate in the lottery
        expect(lottery.connect(owner).participate({value: 1})).to.be.equal('Lottery has ended');
    })

    it('should end the lottery and select a winner', async () => {
        // Participate in the lottery
        await lottery.connect(owner).participate({ value: 1 });

        // Move to a time after the lottery end
        await ethers.provider.send('evm_increaseTime', [3601]); // Assuming 1 hour duration, adjust as needed

        // End the lottery
        await lottery.connect(owner).endLottery();

        // Check if the lottery is no longer active
        expect(await lottery.lotteryActive()).to.equal(false);

        // Check if the winner received the entire balance
        const winnerBalance = await ethers.provider.getBalance(owner.address);
        expect(winnerBalance.gt(0)).to.equal(true);
    })

    it('should start a new lottery', async () => {
        // Participate in the current lottery
        await lottery.connect(owner).participate({value: entryFeeInWei});

        // Move to a time after the lottery end
        await ethers.provider.send("evm_increaseTime", [60])

        // End the current lottery
        await lottery.connect(owner).endLottery();

        // Start a new lottery with different parameters
        await lottery.connect(owner).startNewLottery(2, 7200); // Example entry fee and duration, adjust as needed

        // Check if the new lottery is active
        expect(await lottery.lotteryActive()).to.equal(true);

        // Check if the entry fee and lottery end time are updated
        expect(await lottery.entryFee()).to.equal(2); // Adjust based on your new entry fee
    })
});
