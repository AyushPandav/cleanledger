const { ethers } = require('ethers');

const MAIN_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const CONTRACT_ADDRESS = '0xbA7613a835B1dd8aFC0d972e72309BA23B1fC2c0';
const ABI = [
  "function startups(string memory) external view returns (string id, address wallet, uint256 totalFunding, bool isRegistered)"
];

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider(MAIN_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    console.log("Calling startups('test')...");
    const result = await contract.startups('test');
    console.log("Result:", result);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
