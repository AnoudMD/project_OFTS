require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const batchRoutes = require('./routes/batch.routes');
const eventRoutes = require('./routes/event.routes');
const traceRoutes = require('./routes/trace.routes');
const ipfsBlockchainRoutes = require('./routes/ipfsBlockchain.routes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (_req, res) => res.json({ message: 'OFTS API running' }));
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/trace', traceRoutes);
app.use('/api/ipfs-blockchain', ipfsBlockchainRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
