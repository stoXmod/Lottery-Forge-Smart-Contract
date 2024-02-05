import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import '@typechain/hardhat';
import * as dotenv from 'dotenv';
import {HardhatUserConfig} from 'hardhat/config';
dotenv.config();

const {
  INFURA_API_URL,
  ACCOUNT_PRIVATE_KEY = ''
} = process.env;

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: 'http://localhost:8545'
    },
    hardhat: {
    },
    sepolia: {
      url: INFURA_API_URL,
      accounts: [ACCOUNT_PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  mocha: {
    timeout: 200000 // 200 seconds max for running tests
  },
};

export default config;
