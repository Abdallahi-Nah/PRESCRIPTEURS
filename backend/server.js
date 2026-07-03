import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import prescripteurRoutes from './routes/prescripteurRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/prescripteurs', prescripteurRoutes);

app.get('/api', (req, res) => res.send('API Running'));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

export default app;
