/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ethers, upgrades } from 'hardhat'

async function main() {
    const initialMinter = "0x494b57843E83765D9E1d4d821D39Fb9a00c658f3"
	const USDCMockContract = await ethers.getContractFactory('USDCMock')
	const usdcMockContract = await USDCMockContract.deploy(
        100000000000000000000n,
        initialMinter,
	)
	await usdcMockContract.waitForDeployment()

	console.log('USDCMock address:', await usdcMockContract.getAddress())
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
