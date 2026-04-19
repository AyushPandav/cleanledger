import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

// Load .env from the parent directory where Expo's .env lives
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const BLOCKCHAIN_PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || '0000000000000000000000000000000000000000000000000000000000000000';

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [BLOCKCHAIN_PRIVATE_KEY.startsWith("0x") ? BLOCKCHAIN_PRIVATE_KEY : `0x${BLOCKCHAIN_PRIVATE_KEY}`]
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [BLOCKCHAIN_PRIVATE_KEY.startsWith("0x") ? BLOCKCHAIN_PRIVATE_KEY : `0x${BLOCKCHAIN_PRIVATE_KEY}`]
    }
  }
};

export default config;
