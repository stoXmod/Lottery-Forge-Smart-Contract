import "@nomiclabs/hardhat-ethers";
import '@typechain/hardhat';
import * as dotenv from 'dotenv';
import {HardhatUserConfig} from 'hardhat/config';
dotenv.config();

const {
  INFURA_API_URL,
  ACCOUNT_PRIVATE_KEY = ''
} = process.env;

const config: HardhatUserConfig = {
  defaultNetwork: "sepolia",
  networks: {
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
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};

export default config;
