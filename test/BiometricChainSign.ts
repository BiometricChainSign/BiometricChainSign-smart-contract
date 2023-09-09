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

  it('should sign a document', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer] = await ethers.getSigners()

    const cid = '123456789abcdef'
    await contract.setSignatoryCid(cid)

    const originalDocumentHash = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash = crypto.randomBytes(32).toString('hex')
    await contract.signDocument(stampedDocumentHash, originalDocumentHash)
    const signatories = await contract.getDocumentSignatories(stampedDocumentHash)

    expect(signatories).to.deep.equal([signer.address])
  })

  it('should revert when attempting to sign a document without having a cid', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')

    const originalDocumentHash = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash = crypto.randomBytes(32).toString('hex')

    await expect(
      contract.signDocument(stampedDocumentHash, originalDocumentHash)
    ).to.be.revertedWith('Signatory cid not yet set')
  })
})
