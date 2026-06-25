import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import habitRoutes from './routes/habits';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
