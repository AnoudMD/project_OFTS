/**
 * seed.js — Populates MongoDB with demo OFTS data.
 *
 * Run with:  npm run seed
 *
 * WARNING: This will CLEAR existing Users, Batches, Events, Certifications
 * and ScanHistory before inserting fresh seed data.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Batch = require('../models/Batch');
const SupplyChainEvent = require('../models/SupplyChainEvent');
const Certification = require('../models/Certification');
const ScanHistory = require('../models/ScanHistory');

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[SEED] MONGO_URI is not set. Create backend/.env from .env.example first.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('[SEED] Connected to MongoDB');

  // ── Clear existing data ───────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Batch.deleteMany({}),
    SupplyChainEvent.deleteMany({}),
    Certification.deleteMany({}),
    ScanHistory.deleteMany({}),
  ]);
  console.log('[SEED] Cleared existing collections');

  // ── Create users ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 12);

  const [producer, certifier, distributor, retailer, consumer] = await User.insertMany([
    {
      name: 'Maria Santos',
      email: 'producer@ofts.com',
      passwordHash,
      role: 'producer',
      organization: 'Green Valley Organic Farm',
    },
    {
      name: 'James Reyes',
      email: 'certifier@ofts.com',
      passwordHash,
      role: 'certifier',
      organization: 'Organic Certification Authority',
    },
    {
      name: 'Ana Cruz',
      email: 'distributor@ofts.com',
      passwordHash,
      role: 'distributor',
      organization: 'EcoRoute Logistics',
    },
    {
      name: 'Carlos Mendez',
      email: 'retailer@ofts.com',
      passwordHash,
      role: 'retailer',
      organization: "Nature's Basket Supermarket",
    },
    {
      name: 'Demo Consumer',
      email: 'consumer@ofts.com',
      passwordHash,
      role: 'consumer',
      organization: '',
    },
  ]);
  console.log('[SEED] Created 5 users');

  // ── Create batches ────────────────────────────────────────────────────────
  const [coffee, rice, turmeric, coconut, cacao] = await Batch.insertMany([
    {
      batchId: 'OT-2025-001234',
      productName: 'Organic Arabica Coffee Beans',
      farmName: 'Green Valley Organic Farm',
      category: 'Coffee',
      origin: 'Benguet, Philippines',
      productionDate: new Date('2025-01-10'),
      expiryDate: new Date('2026-01-10'),
      quantity: '500 kg',
      notes: 'Single-origin high-altitude Arabica, shade-grown. Harvested at peak ripeness.',
      certificationStatus: 'Approved',
      certifierNotes: 'Meets all USDA organic standards. Farm inspection passed.',
      reviewedAt: new Date('2025-01-15'),
      reviewedBy: certifier._id,
      certificationDocuments: [
        { name: 'organic_cert_2025.pdf', type: 'PDF', size: '2.4 MB', url: '', uploadedAt: new Date('2025-01-12') },
      ],
      createdBy: producer._id,
      producerName: producer.name,
    },
    {
      batchId: 'OT-2025-001891',
      productName: 'Organic Brown Rice',
      farmName: 'SunGrain Organic Fields',
      category: 'Grains',
      origin: 'Nueva Ecija, Philippines',
      productionDate: new Date('2025-02-05'),
      expiryDate: new Date('2026-08-05'),
      quantity: '1,200 kg',
      notes: 'Heirloom Milagrosa variety, no synthetic pesticides.',
      certificationStatus: 'Pending',
      certificationDocuments: [],
      createdBy: producer._id,
      producerName: producer.name,
    },
    {
      batchId: 'OT-2025-002456',
      productName: 'Organic Turmeric Powder',
      farmName: 'Spice Hills Farm',
      category: 'Spices',
      origin: 'Bukidnon, Philippines',
      productionDate: new Date('2025-03-01'),
      expiryDate: new Date('2026-03-01'),
      quantity: '300 kg',
      notes: 'Sun-dried and cold-ground. High curcumin content.',
      certificationStatus: 'Under Review',
      certificationDocuments: [
        { name: 'lab_analysis_turmeric.pdf', type: 'PDF', size: '1.1 MB', url: '', uploadedAt: new Date('2025-03-05') },
      ],
      createdBy: producer._id,
      producerName: producer.name,
    },
    {
      batchId: 'OT-2025-003012',
      productName: 'Organic Virgin Coconut Oil',
      farmName: 'Tropical Harvest Co.',
      category: 'Oils',
      origin: 'Quezon, Philippines',
      productionDate: new Date('2025-03-15'),
      expiryDate: new Date('2027-03-15'),
      quantity: '800 L',
      notes: 'Cold-pressed within 2 hours of harvesting.',
      certificationStatus: 'Rejected',
      certifierNotes: 'Missing soil test report. Resubmit with complete documentation.',
      certificationDocuments: [],
      createdBy: producer._id,
      producerName: producer.name,
    },
    {
      batchId: 'OT-2025-003567',
      productName: 'Organic Cacao Nibs',
      farmName: 'Cacao de Oro Farm',
      category: 'Cacao',
      origin: 'Davao, Philippines',
      productionDate: new Date('2025-04-01'),
      expiryDate: new Date('2026-04-01'),
      quantity: '250 kg',
      notes: 'Fine-flavor cacao, fermented 6 days.',
      certificationStatus: 'Approved',
      certificationDocuments: [
        { name: 'cacao_cert_2025.pdf', type: 'PDF', size: '3.1 MB', url: '', uploadedAt: new Date('2025-04-05') },
      ],
      createdBy: producer._id,
      producerName: producer.name,
    },
  ]);
  console.log('[SEED] Created 5 batches');

  // ── Create supply chain events ────────────────────────────────────────────
  await SupplyChainEvent.insertMany([
    // Coffee events
    { batch: coffee._id, batchId: 'OT-2025-001234', eventType: 'Harvest', location: 'Green Valley Farm, Benguet', timestamp: new Date('2025-01-10T06:00:00Z'), notes: 'Cherries hand-picked at 1,500m elevation', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: coffee._id, batchId: 'OT-2025-001234', eventType: 'Processing', location: 'Green Valley Processing Unit, Benguet', timestamp: new Date('2025-01-12T08:00:00Z'), notes: 'Washed process, fermented 36 hours', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: coffee._id, batchId: 'OT-2025-001234', eventType: 'Quality Check', location: 'Organic Certification Authority, Manila', timestamp: new Date('2025-01-15T10:00:00Z'), notes: 'Moisture content 11.5%, Grade AA', actorRole: 'certifier', actor: certifier._id, actorName: certifier.name },
    { batch: coffee._id, batchId: 'OT-2025-001234', eventType: 'Packaging', location: 'GreenPack Facility, Pampanga', timestamp: new Date('2025-01-18T09:00:00Z'), notes: 'Vacuum-sealed in 1 kg eco-bags', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: coffee._id, batchId: 'OT-2025-001234', eventType: 'Shipment', location: 'EcoRoute Logistics Hub, Manila', timestamp: new Date('2025-01-20T07:00:00Z'), notes: 'Cold-chain transport, batch sealed', actorRole: 'distributor', actor: distributor._id, actorName: distributor.name },
    { batch: coffee._id, batchId: 'OT-2025-001234', eventType: 'Distribution', location: "Nature's Basket Warehouse, Quezon City", timestamp: new Date('2025-01-22T14:00:00Z'), notes: 'Received in full. Batch scanned and stocked.', actorRole: 'retailer', actor: retailer._id, actorName: retailer.name },
    // Rice events
    { batch: rice._id, batchId: 'OT-2025-001891', eventType: 'Harvest', location: 'SunGrain Fields, Nueva Ecija', timestamp: new Date('2025-02-05T07:00:00Z'), notes: 'Manual harvest, sunny conditions', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: rice._id, batchId: 'OT-2025-001891', eventType: 'Processing', location: 'SunGrain Mill, Nueva Ecija', timestamp: new Date('2025-02-08T08:00:00Z'), notes: 'Traditional stone milling', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    // Turmeric events
    { batch: turmeric._id, batchId: 'OT-2025-002456', eventType: 'Harvest', location: 'Spice Hills Farm, Bukidnon', timestamp: new Date('2025-03-01T06:30:00Z'), notes: '9-month old rhizomes harvested', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: turmeric._id, batchId: 'OT-2025-002456', eventType: 'Processing', location: 'Spice Hills Processing, Bukidnon', timestamp: new Date('2025-03-03T09:00:00Z'), notes: 'Boiled, dried, and milled', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: turmeric._id, batchId: 'OT-2025-002456', eventType: 'Quality Check', location: 'Organic Certification Authority, Manila', timestamp: new Date('2025-03-07T11:00:00Z'), notes: 'Lab analysis submitted. Curcumin: 4.2%', actorRole: 'certifier', actor: certifier._id, actorName: certifier.name },
    // Coconut events
    { batch: coconut._id, batchId: 'OT-2025-003012', eventType: 'Harvest', location: 'Tropical Harvest Plantation, Quezon', timestamp: new Date('2025-03-15T06:00:00Z'), notes: 'Fresh mature coconuts harvested', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    // Cacao events
    { batch: cacao._id, batchId: 'OT-2025-003567', eventType: 'Harvest', location: 'Cacao de Oro Farm, Davao', timestamp: new Date('2025-04-01T07:00:00Z'), notes: 'Ripe pods harvested and opened', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: cacao._id, batchId: 'OT-2025-003567', eventType: 'Processing', location: 'Cacao de Oro Processing, Davao', timestamp: new Date('2025-04-03T08:00:00Z'), notes: 'Fermented, dried, and roasted', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: cacao._id, batchId: 'OT-2025-003567', eventType: 'Packaging', location: 'Davao Export Facility', timestamp: new Date('2025-04-10T09:00:00Z'), notes: 'Packed in resealable foil bags', actorRole: 'producer', actor: producer._id, actorName: producer.name },
    { batch: cacao._id, batchId: 'OT-2025-003567', eventType: 'Shipment', location: 'EcoRoute Logistics Hub, Manila', timestamp: new Date('2025-04-12T07:00:00Z'), notes: 'Shipped to distribution warehouse', actorRole: 'distributor', actor: distributor._id, actorName: distributor.name },
  ]);
  console.log('[SEED] Created supply chain events');

  // ── Create certification records ──────────────────────────────────────────
  await Certification.insertMany([
    { batch: coffee._id, batchId: 'OT-2025-001234', certifier: certifier._id, status: 'Approved', remarks: 'Meets all USDA organic standards.' },
    { batch: rice._id, batchId: 'OT-2025-001891', status: 'Pending', remarks: '' },
    { batch: turmeric._id, batchId: 'OT-2025-002456', certifier: certifier._id, status: 'Under Review', remarks: 'Lab analysis in progress.' },
    { batch: coconut._id, batchId: 'OT-2025-003012', certifier: certifier._id, status: 'Rejected', remarks: 'Missing soil test report.' },
    { batch: cacao._id, batchId: 'OT-2025-003567', certifier: certifier._id, status: 'Approved', remarks: 'All documents verified.' },
  ]);
  console.log('[SEED] Created certification records');

  // ── Create sample scan history for consumer ───────────────────────────────
  await ScanHistory.insertMany([
    { batch: coffee._id, batchId: 'OT-2025-001234', productName: coffee.productName, farmName: coffee.farmName, certificationStatus: coffee.certificationStatus, scannedBy: consumer._id, scannedAt: new Date('2025-04-20T09:15:00Z') },
    { batch: cacao._id, batchId: 'OT-2025-003567', productName: cacao.productName, farmName: cacao.farmName, certificationStatus: cacao.certificationStatus, scannedBy: consumer._id, scannedAt: new Date('2025-04-19T14:32:00Z') },
    { batch: rice._id, batchId: 'OT-2025-001891', productName: rice.productName, farmName: rice.farmName, certificationStatus: rice.certificationStatus, scannedBy: consumer._id, scannedAt: new Date('2025-04-18T11:05:00Z') },
  ]);
  console.log('[SEED] Created scan history');

  console.log('\n[SEED] Done! Demo accounts:');
  console.log('  producer@ofts.com    / password123');
  console.log('  certifier@ofts.com   / password123');
  console.log('  distributor@ofts.com / password123');
  console.log('  retailer@ofts.com    / password123');
  console.log('  consumer@ofts.com    / password123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[SEED] Error:', err);
  process.exit(1);
});
