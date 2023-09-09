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

  it('should sign a document twice by two different signatories', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer1, signer2] = await ethers.getSigners()

    const cid1 = '123456789abcdef'
    const cid2 = 'fedcba987654321'
    await contract.setSignatoryCid(cid1)
    await contract.connect(signer2).setSignatoryCid(cid2)

    const originalDocumentHash = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash1 = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash2 = crypto.randomBytes(32).toString('hex')
    await contract.signDocument(stampedDocumentHash1, originalDocumentHash)
    await contract.connect(signer2).signDocument(stampedDocumentHash2, originalDocumentHash)
    const signatories = await contract.getDocumentSignatories(stampedDocumentHash1)

    expect(signatories).to.deep.equal([signer1.address, signer2.address])
  })

  it('should revert when attempting to sign a document without having a cid', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')

    const originalDocumentHash = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash = crypto.randomBytes(32).toString('hex')

    await expect(
      contract.signDocument(stampedDocumentHash, originalDocumentHash)
    ).to.be.revertedWith('Signatory cid not yet set')
  })

  it('should revert when a single signatory is attempting to sign a document twice', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')

    const cid = '123456789abcdef'
    await contract.setSignatoryCid(cid)

    const originalDocumentHash = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash1 = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash2 = crypto.randomBytes(32).toString('hex')
    await contract.signDocument(stampedDocumentHash1, originalDocumentHash)

    await expect(
      contract.signDocument(stampedDocumentHash2, originalDocumentHash)
    ).to.be.revertedWith('Signatory has already signed this document')
  })

  it('should revert when attempting to sign a stamped document that has already been signed', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer1, signer2] = await ethers.getSigners()

    const cid1 = '123456789abcdef'
    const cid2 = 'fedcba987654321'
    await contract.setSignatoryCid(cid1)
    await contract.connect(signer2).setSignatoryCid(cid2)

    const originalDocumentHash = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash = crypto.randomBytes(32).toString('hex')
    await contract.signDocument(stampedDocumentHash, originalDocumentHash)

    await expect(
      contract.connect(signer2).signDocument(stampedDocumentHash, originalDocumentHash)
    ).to.be.revertedWith('Stamped document has already been signed')
  })
})
