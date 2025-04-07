import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import evaluationRoutes from './routes/evaluations';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(fileUpload());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/npni')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'NPNI 3.0 API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
