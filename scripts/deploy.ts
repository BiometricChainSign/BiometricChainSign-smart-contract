import { ethers } from 'hardhat'

async function main() {
  const biometricChainSign = await ethers.deployContract('BiometricChainSign')
  await biometricChainSign.waitForDeployment()
  console.log('Deployed')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
