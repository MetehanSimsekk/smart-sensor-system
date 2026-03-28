import { Request, Response } from 'express';
import UserLog from '../models/UserLog';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { UserRole } from '../models/User';
import { Op } from 'sequelize';

export const createLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, metadata } = req.body;

    await UserLog.create({
      userId: req.user!.id,
      action,
      timestamp: new Date(),
      metadata
    });

    res.status(201).json({ message: 'Log kaydedildi.' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const getLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, action, startDate, endDate, limit = 50 } = req.query;
    const where: any = {};

    if (req.user?.role !== UserRole.SYSTEM_ADMIN) {
      where.userId = req.user?.id;
    }

    if (userId && req.user?.role === UserRole.SYSTEM_ADMIN) {
      where.userId = userId;
    }
    if (action) where.action = action;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate as string);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate as string);
    }

    const logs = await UserLog.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: Number(limit)
    });

    await UserLog.create({
      userId: req.user!.id,
      action: 'viewed_logs',
      timestamp: new Date(),
      metadata: { filters: req.query }
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

export const getLogAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await UserLog.findAll({
      order: [['timestamp', 'ASC']]
    });

    const hourlyDistribution: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) hourlyDistribution[i] = 0;
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    });

    const dailyDistribution: { [key: string]: number } = {};
    logs.forEach(log => {
      const day = new Date(log.timestamp).toISOString().split('T')[0];
      dailyDistribution[day] = (dailyDistribution[day] || 0) + 1;
    });

    const userActivity: { [key: string]: number } = {};
    logs.forEach(log => {
      userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;
    });
    
    const userIds = Object.keys(userActivity);
    const users = await User.findAll({ 
      where: { id: userIds },
      attributes: ['id', 'name']
    });
    
    const userMap = users.reduce((acc: Record<string, string>, user: any) => {
      acc[user.id] = user.name;
      return acc;
    }, {} as Record<string, string>);
    
    const topUsers = Object.entries(userActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, count]) => ({ 
        userId, 
        userName: userMap[userId] || 'Silinen Kullanıcı', 
        count 
      }));

    const dailyCounts = Object.values(dailyDistribution);
    const avg = dailyCounts.reduce((a, b) => a + b, 0) / (dailyCounts.length || 1);
    const today = new Date().toISOString().split('T')[0];
    const todayCount = dailyDistribution[today] || 0;
    const isAnomaly = todayCount > avg * 2;

    const hourlyValues = Object.values(hourlyDistribution);
    const movingAvg = hourlyValues.map((_, i) => {
      const window = hourlyValues.slice(Math.max(0, i - 2), i + 3);
      return Math.round(window.reduce((a, b) => a + b, 0) / window.length);
    });

    const prediction = movingAvg.map((value, hour) => ({ hour, predicted: value }));

    res.json({
      total: logs.length,
      hourlyDistribution,
      dailyDistribution,
      topUsers,
      anomaly: {
        detected: isAnomaly,
        todayCount,
        average: Math.round(avg),
        message: isAnomaly
          ? `⚠️ Bugün anormal aktivite tespit edildi! (${todayCount} istek, ortalama: ${Math.round(avg)})`
          : `✅ Normal aktivite seviyesi`
      },
      prediction
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};