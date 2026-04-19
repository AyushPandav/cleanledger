require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const BLOCKCHAIN_PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || '0000000000000000000000000000000000000000000000000000000000000000';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [BLOCKCHAIN_PRIVATE_KEY]
    }
  }
};
