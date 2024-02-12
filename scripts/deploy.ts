import { ethers } from 'hardhat';
async function main() {
    let owner;
    const [deployer] = await ethers.getSigners();
    console.log("🤑 Deploying contracts with the account:", deployer.address);

    // Set the values for _entryFee and _lotteryEnd
    const entryFeeInEther = "0.01";
    const _entryFeeInWei = ethers.utils.parseEther(entryFeeInEther);
    const _lotteryEndTimeInSeconds = 3600;
    const _winnerPrizeAmount = ethers.utils.parseEther("0.1");

    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(_entryFeeInWei, _lotteryEndTimeInSeconds, _winnerPrizeAmount);
   // Get the owner's address
    [owner] = await ethers.getSigners();
    console.log('🧑🏻‍💻 Owner address:', owner.address);

    // add some funds to contract
    const tx = await owner.sendTransaction({
      to: lottery.address,
      value: ethers.utils.parseEther("20.0")
    });
    await tx.wait();
    console.log('🚀 Lottery contract address:', lottery.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('🔴 Error occurred while deploying!', error);
        process.exit(1);
    });
