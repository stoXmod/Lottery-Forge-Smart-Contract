import {ethers} from 'hardhat';
import {Contract} from "ethers";
import {expect} from "chai";
import "@nomiclabs/hardhat-waffle";

describe('Lottery Contract', function () {
    const entryFeeInEther = "0.01";
    const entryFeeInWei = ethers.utils.parseEther(entryFeeInEther);
    const winnerPrizeAmount = ethers.utils.parseEther("0.1");
    let lottery: Contract;
    let owner: any;
    this.timeout(40000)

    beforeEach(async function (){
        const LotteryFactory = await ethers.getContractFactory('Lottery');
        lottery = await LotteryFactory.deploy(entryFeeInWei, 3600, winnerPrizeAmount);
        // Deploy the contract
        await lottery.deployed();
        // Get the owner's address
        [owner] = await ethers.getSigners();
        console.log('🚀 Owner address:', owner.address);

       // get the address of the deployed contract
        console.log('🚀 Lottery contract address:', lottery.address);

       // add some funds to contract
        const tx = await owner.sendTransaction({
            to: lottery.address,
            value: ethers.utils.parseEther("1.0")
        });
        await tx.wait();
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
        const participant = await lottery.getParticipantByIndex(0);
        console.log('🤑 Participant: ', participant)
        expect(participant).to.equal(owner.address);
    })

    it('should not allow entry after lottery has ended', async () => {
        await ethers.provider.send('evm_increaseTime', [3602]); // Assuming 1 hour duration, adjust as needed
        await ethers.provider.send('evm_mine', []);

        // Expect the transaction to be reverted with the specific error message
        try {
            await lottery.connect(owner).participate({ value: entryFeeInWei })
        } catch (error) {
            expect((error as Error).message).to.include("Lottery has ended");
        }
    })

    it('should end the lottery and select a winner', async () => {
        // get contract balance
        const contractBalance = await lottery.getContractBalance();
        console.log('🤖 Contract balance: ', ethers.utils.formatEther(contractBalance));

        const previousBalance = await ethers.provider.getBalance(owner.address);

        console.log('☘️ Previous balance of the participant: ', ethers.utils.formatEther(previousBalance));

        const signer = ethers.provider.getSigner(owner.address);
        // Participate in the lottery
        await lottery.connect(signer).participate({value: entryFeeInWei});

        // Move to a time after the lottery end
        await ethers.provider.send('evm_increaseTime', [3601]); // Assuming 1 hour duration

        // End the lottery
        await lottery.connect(owner).endLottery();

        // Check if the lottery is no longer active
        expect(await lottery.lotteryActive()).to.equal(false);

        // get the winner
        const winner = await lottery.winner()
        console.log('🎉 Winner: ', winner);

        // Check if the winner received the entire balance
        const winnerBalance = await ethers.provider.getBalance(owner.address);
        console.log('🎉 Final balance with win amount: ', ethers.utils.formatEther(winnerBalance));
        expect(Number(winnerBalance)).to.be.gt(Number(previousBalance));
    })

    it('should not end the lottery if ongoing', async () => {
        // Participate in the current lottery
        await lottery.connect(owner).participate({value: entryFeeInWei});

        try {
            await lottery.connect(owner).endLottery();
        } catch (error) {
            expect((error as Error).message).to.include("Lottery still ongoing");
        }
    })

    it('should start a new lottery', async () => {
        const newEntryFee = String(Number(entryFeeInWei) * 2);
        // Participate in the current lottery
        await lottery.connect(owner).participate({value: entryFeeInWei});

        // Move to a time after the lottery end
        await ethers.provider.send("evm_increaseTime", [3601])
        await ethers.provider.send("evm_mine", [])

        // End the current lottery
        await lottery.connect(owner).endLottery();

        // Start a new lottery with different parameters
        await lottery.connect(owner).startNewLottery(newEntryFee, 3600, winnerPrizeAmount);

        // Check if the new lottery is active
        expect(await lottery.lotteryActive()).to.equal(true);

        // Check if the entry fee and lottery end time are updated
        expect(await lottery.entryFee()).to.equal(newEntryFee);
    })
});
