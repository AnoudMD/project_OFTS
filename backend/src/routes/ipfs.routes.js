const express = require('express');
const axios = require('axios');
const { db } = require('../config/firebaseAdmin');
const { writeCertificateOnChain } = require('../services/blockchain.service');

const router = express.Router();

router.post('/upload-certificate/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certRef = db.collection('certificates').doc(certificateId);
    const certSnap = await certRef.get();

    if (!certSnap.exists) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const certificate = certSnap.data();

    const batchRef = db.collection('batches').doc(certificate.batchId);
    const batchSnap = await batchRef.get();
    const batch = batchSnap.exists
      ? { id: batchSnap.id, ...batchSnap.data() }
      : null;

    let product = null;
    if (certificate.productBarcode) {
      const productRef = db.collection('products').doc(certificate.productBarcode);
      const productSnap = await productRef.get();

      if (productSnap.exists) {
        product = { id: productSnap.id, ...productSnap.data() };
      }
    }

    const eventsSnap = await db
      .collection('batches')
      .doc(certificate.batchId)
      .collection('events')
      .get();

    const events = eventsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const payload = {
      certificateId,
      certificate,
      batch,
      product,
      events,
      exportedAt: new Date().toISOString(),
    };

    const pinataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataMetadata: {
          name: `certificate-${certificateId}`,
        },
        pinataContent: payload,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const cid = pinataResponse.data.IpfsHash;

    await certRef.update({
      ipfsCid: cid,
      blockchainStatus: 'uploaded_to_ipfs',
    });

    const onChainResult = await writeCertificateOnChain({
      batchId: certificate.batchId,
      certificateNumber: certificate.certificateNumber,
      ipfsCid: cid,
      certifierId: certificate.certifierId,
    });

    await certRef.update({
      txHash: onChainResult.txHash,
      blockchainStatus: 'recorded_onchain',
    });

    return res.status(200).json({
      message: 'Certificate uploaded to IPFS and recorded on blockchain successfully',
      certificateId,
      cid,
      txHash: onChainResult.txHash,
    });
  } catch (error) {
    console.error('IPFS / blockchain error:', error?.response?.data || error.message);

    return res.status(500).json({
      message: 'Failed to upload certificate to IPFS / blockchain',
      error: error?.response?.data || error.message,
    });
  }
});

module.exports = router;