import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import { connectMQTT } from './mqtt/subscriber';
import sensorRoutes from './routes/sensors';
import userRoutes from './routes/users';
import logRoutes from './routes/logs';
import companyRoutes from './routes/companies';
import customerRoutes from './routes/customers';
import userSensorsRoutes from './routes/userSensors';
import './models/associations';


dotenv.config();

export const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Çok fazla istek, lütfen bekleyin.' }
});
app.use('/api', limiter);

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/user', userSensorsRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint bulunamadı.' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Sunucu hatası.'
  });
});

// Socket.io bağlantısı
io.on('connection', (socket) => {
  console.log(`🔌 Yeni bağlantı: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Bağlantı kesildi: ${socket.id}`);
  });
});

// io'yu dışarı aktar
app.set('io', io);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, async () => {
    await connectDB();
    connectMQTT(io);
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
    console.log(`🌍 Ortam: ${process.env.NODE_ENV || 'development'}`);
  });
}

export {  io };