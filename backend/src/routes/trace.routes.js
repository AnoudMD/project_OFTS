const express = require('express');
const { db } = require('../config/firebaseAdmin');

const router = express.Router();

router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const batchRef = db.collection('batches').doc(batchId);
    const batchSnap = await batchRef.get();

    if (!batchSnap.exists) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const batch = {
      id: batchSnap.id,
      ...batchSnap.data(),
    };

    let certificate = null;
    const certificateQuery = await db
      .collection('certificates')
      .where('batchId', '==', batchId)
      .limit(1)
      .get();

    if (!certificateQuery.empty) {
      const certDoc = certificateQuery.docs[0];
      certificate = {
        id: certDoc.id,
        ...certDoc.data(),
      };
    }

    let product = null;
    const productBarcode = batch.productBarcode || certificate?.productBarcode;

    if (productBarcode) {
      const productRef = db.collection('products').doc(productBarcode);
      const productSnap = await productRef.get();

      if (productSnap.exists) {
        product = {
          id: productSnap.id,
          ...productSnap.data(),
        };
      }
    }

    const eventsSnap = await db
      .collection('batches')
      .doc(batchId)
      .collection('events')
      .get();

    const events = eventsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      batch,
      product,
      certificate,
      events,
    });
  } catch (error) {
    console.error('TRACE LOOKUP ERROR:', error);
    return res.status(500).json({
      message: error.message || 'Failed to fetch traceability data',
    });
  }
});

module.exports = router;