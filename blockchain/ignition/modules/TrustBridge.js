import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TrustBridgeModule", (m) => {
  const trustBridge = m.contract("TrustBridge", []);
  
  return { trustBridge };
});
