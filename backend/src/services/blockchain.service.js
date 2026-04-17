const { ethers } = require('ethers');

const abi = [
  "function registerCertificate(string batchId, string certificateNumber, string ipfsCid, string certifierId) public",
  "function getCertificate(string batchId) view returns (string, string, string, string, uint256, bool)"
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

async function writeCertificateOnChain({ batchId, certificateNumber, ipfsCid, certifierId }) {
  const tx = await contract.registerCertificate(
    batchId,
    certificateNumber,
    ipfsCid,
    certifierId
  );

  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
  };
}

module.exports = {
  writeCertificateOnChain,
};