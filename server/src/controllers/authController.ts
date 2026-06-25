import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email: email.toLowerCase(), passwordHash });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { _id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { _id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};
