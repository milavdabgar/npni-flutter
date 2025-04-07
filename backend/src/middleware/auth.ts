import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import type { CustomRequest, UserDocument } from '../types/index';

interface JwtPayload {
  id: string;
  role: string;
}

const authenticateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    const user = await User.findById(decoded.id) as UserDocument | null;

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const authenticateJury = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await authenticateUser(req, res, () => {
      if (!req.user || req.user.role !== 'jury') {
        return res.status(403).json({ message: 'Not authorized as jury' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const authenticateAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    await authenticateUser(req, res, () => {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as admin' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export { authenticateUser, authenticateJury, authenticateAdmin };
