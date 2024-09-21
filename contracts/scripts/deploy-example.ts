/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ethers, upgrades, network } from 'hardhat'

async function main() {
	const usdcAddresses: { [key: string]: string } = {
		polygonMainnet: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // Polygon USDC
		gnosisTestnet: '0xF72C8Fe9Af2FC838A60b02B38c3A3C4af1979ebD', // Gnosis Testnet USDC
		baseSepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',// Add more networks as needed
		lineaSepolia: '0xF72C8Fe9Af2FC838A60b02B38c3A3C4af1979ebD',
		morphHolesky: '0xF72C8Fe9Af2FC838A60b02B38c3A3C4af1979ebD',
	  };

	const networkName = network.name;

	console.log(`Deploying to network: ${networkName}`);

	const usdcAddress = usdcAddresses[networkName];
	if (!usdcAddress) {
		throw new Error(`USDC address not found for network: ${networkName}`);
	}
	const AgentContract = await ethers.getContractFactory('AgentMarketPlace')
	const agentContract = await AgentContract.deploy(
		usdcAddress
	)
	await agentContract.waitForDeployment()

	console.log('AgentMarketPlace address:', await agentContract.getAddress())
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
