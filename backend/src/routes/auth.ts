import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateAdmin } from '../middleware/auth';
import type { IUser, CustomRequest } from '../types/index';

const router: Router = Router();

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Convert email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase();
    console.log('Normalized email:', normalizedEmail);

    // Try finding user with both original and lowercase email
    let user = await User.findOne({ email }) || await User.findOne({ email: normalizedEmail });
    console.log('Found user:', user ? 'yes' : 'no');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    console.log('Checking password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'yes' : 'no');
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
router.post('/register', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role
    });

    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticateAdmin, async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
