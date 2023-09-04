import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('BiometricChainSign', () => {
  it('should create a signatory', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer] = await ethers.getSigners()

    const cid = '123456789abcdef'
    await contract.connect(signer).createSignatory(cid)
    const signatory = await contract.getSignatory(signer.address)

    expect(signatory).to.deep.equal([signer.address, cid])
  })
})
