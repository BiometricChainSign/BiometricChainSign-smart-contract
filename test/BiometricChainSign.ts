import { expect } from 'chai'
import { ethers } from 'hardhat'
import crypto from 'crypto'

describe('BiometricChainSign', () => {
  it('should create a signatory', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer] = await ethers.getSigners()

    const cid = '123456789abcdef'
    await contract.connect(signer).createSignatory(cid)
    const signatory = await contract.getSignatory(signer.address)

    expect(signatory).to.deep.equal([signer.address, cid])
  })

  it('should add a signature', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer] = await ethers.getSigners()

    const cid = '123456789abcdef'
    await contract.createSignatory(cid)
    const documentHash = crypto.randomBytes(32).toString('hex')
    await contract.addSignature(documentHash)
    const signatories = await contract.getSignatureSignatories(documentHash)

    expect(signatories).to.deep.equal([signer.address])
  })
})
