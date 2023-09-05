import { expect } from 'chai'
import { ethers } from 'hardhat'
import crypto from 'crypto'

describe('BiometricChainSign', () => {
  it('should set the cid of a signatory', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer] = await ethers.getSigners()

    const cidInput = '123456789abcdef'
    await contract.setSignatoryCid(cidInput)
    const cidOutput = await contract.getSignatoryCid(signer.address)

    expect(cidOutput).to.deep.equal(cidInput)
  })

  it("should revert when attempting to set a signatory's cid twice", async () => {
    const contract = await ethers.deployContract('BiometricChainSign')

    const cidInput = '123456789abcdef'
    await contract.setSignatoryCid(cidInput)

    await expect(contract.setSignatoryCid('fedcba987654321')).to.be.revertedWith(
      'Signatory cid already set'
    )
  })

  it('should add a signature', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer] = await ethers.getSigners()

    const cid = '123456789abcdef'
    await contract.setSignatoryCid(cid)
    const documentHash = crypto.randomBytes(32).toString('hex')
    await contract.signDocument(documentHash)
    const signatories = await contract.getDocumentSignatories(documentHash)

    expect(signatories).to.deep.equal([signer.address])
  })

  it('should revert when attempting to sign a document without having a cid', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')

    const documentHash = crypto.randomBytes(32).toString('hex')
    expect(contract.signDocument(documentHash)).to.be.revertedWith('Signatory cid not yet set')
  })
})
