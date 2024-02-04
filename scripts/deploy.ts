import { ethers } from 'hardhat';
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🤑 Deploying contracts with the account:", deployer.address);

    // Set the values for _entryFee and _lotteryEnd
    const _entryFee = 1; // Replace with your desired entry fee
    const _lotteryEnd = 3600; // Replace with your desired lottery end time in seconds

    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(_entryFee, _lotteryEnd);
    console.log("🚀 Lottery address:", lottery.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('🔴 Error occurred while deploying!', error);
        process.exit(1);
    });
