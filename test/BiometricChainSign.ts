import { expect } from 'chai'
import { ethers } from 'hardhat'
import crypto from 'crypto'

const language = 'pt-br' || undefined

describe('BiometricChainSign', () => {
  // RF 1.a Registro de Signatários
  // deve definir o cid de um signatário
  it(
    language
      ? 'RF 1.a Registro de Signatários - Novos signatários'
      : 'should set the cid of a signatory',
    async () => {
      const contract = await ethers.deployContract('BiometricChainSign')
      const [signer] = await ethers.getSigners()

      const cidInput = '123456789abcdef'
      await contract.setSignatoryCid(cidInput)
      const cidOutput = await contract.getSignatoryCid(signer.address)

      expect(cidOutput).to.deep.equal(cidInput)
    }
  )

  // RF 1.b Registro de Signatários - Identificação única
  // deve reverter ao tentar definir o cid de um signatário duas vezes
  it(
    language
      ? 'RF 1.b Registro de Signatários - Identificação única'
      : "should revert when attempting to set a signatory's cid twice",
    async () => {
      const contract = await ethers.deployContract('BiometricChainSign')

      const cidInput = '123456789abcdef'
      await contract.setSignatoryCid(cidInput)

      await expect(contract.setSignatoryCid('fedcba987654321')).to.be.revertedWith(
        'Signatory cid already set'
      )
    }
  )

  // RF 2.a Armazenamento na blockchain - Informações armazenadas na blockchain
  // deve assinar um documento
  it(
    language
      ? 'RF 2.a Armazenamento na blockchain - Informações armazenadas na blockchain'
      : 'should sign a document',
    async () => {
      const contract = await ethers.deployContract('BiometricChainSign')
      const [signer] = await ethers.getSigners()

      const cid = '123456789abcdef'
      await contract.setSignatoryCid(cid)

      const originalDocumentHash = crypto.randomBytes(32).toString('hex')
      const stampedDocumentHash = crypto.randomBytes(32).toString('hex')
      await contract.signDocument(stampedDocumentHash, originalDocumentHash)
      const signatories = await contract.getDocumentSignatories(stampedDocumentHash)

      expect(signatories).to.deep.equal([signer.address])
    }
  )

  // RF 3.a - 3.b Verificação de Assinatura
  // deve verificar a assinatura
  it(
    language ? 'RF 3.a - 3.b Verificação de Assinatura' : 'should verify the signature',
    async () => {
      const contract = await ethers.deployContract('BiometricChainSign')
      const [signer] = await ethers.getSigners()

      const cid = '123456789abcdef'
      await contract.setSignatoryCid(cid)

      const originalDocumentHash = crypto.randomBytes(32).toString('hex')
      const stampedDocumentHash = crypto.randomBytes(32).toString('hex')
      await contract.signDocument(stampedDocumentHash, originalDocumentHash)
      await contract.getDocumentSignatories(stampedDocumentHash)
      const documentSignatories = await contract.getDocumentSignatories(stampedDocumentHash)

      expect(documentSignatories.length == 1 && documentSignatories.includes(signer.address)).equal(
        true
      )
    }
  )

  // deve assinar um documento mais de uma vez de diferentes signatários
  it('should sign a document more than once from different signatories', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')
    const [signer1, signer2, signer3] = await ethers.getSigners()

    const cid1 = '123456789abcdef'
    const cid2 = 'fedcba987654321'
    const cid3 = 'abrobraa7654321'

    await contract.setSignatoryCid(cid1)
    await contract.connect(signer2).setSignatoryCid(cid2)
    await contract.connect(signer3).setSignatoryCid(cid3)

    const originalDocumentHash = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash1 = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash2 = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash3 = crypto.randomBytes(32).toString('hex')

    await contract.signDocument(stampedDocumentHash1, originalDocumentHash)
    await contract.connect(signer2).signDocument(stampedDocumentHash2, stampedDocumentHash1)

    let signatories = await contract.getDocumentSignatories(stampedDocumentHash1)
    expect(signatories).to.deep.equal([signer1.address, signer2.address])

    // ensure that the original document hash can be provided as a parent document hash
    await contract.connect(signer3).signDocument(stampedDocumentHash3, originalDocumentHash)
    signatories = await contract.getDocumentSignatories(originalDocumentHash)
    expect(signatories).to.deep.equal([signer1.address, signer2.address, signer3.address])
  })

  // deve reverter ao tentar assinar um documento sem ter um cid
  it('should revert when attempting to sign a document without having a cid', async () => {
    const contract = await ethers.deployContract('BiometricChainSign')

    const originalDocumentHash = crypto.randomBytes(32).toString('hex')
    const stampedDocumentHash = crypto.randomBytes(32).toString('hex')

    await expect(
      contract.signDocument(stampedDocumentHash, originalDocumentHash)
    ).to.be.revertedWith('Signatory cid not yet set')
  })

  // deve ser revertido quando um único signatário tenta assinar um documento duas vezes
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
    ).to.be.revertedWith('You have already signed this document')
  })

  // deve reverter ao tentar assinar um documento carimbado que já foi assinado
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
