import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { IUser } from '../types/index.js';
import VirtualAccount from '../models/VirtualAccount.js';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: IUser;
}

// Create or update virtual account
export const createOrUpdateVirtualAccount = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { 
      accountNumber, 
      accountName, 
      bankName = 'PalmPay', 
      provider = 'payrant', 
      reference, 
      status = 'active',
      metadata = {}
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Check if user already has a virtual account with this provider
    let virtualAccount = await VirtualAccount.findOne({ 
      user: req.user._id, 
      provider 
    });

    if (virtualAccount) {
      // Update existing virtual account
      virtualAccount = await VirtualAccount.findOneAndUpdate(
        { _id: virtualAccount._id },
        { 
          accountNumber,
          accountName,
          bankName,
          reference,
          status,
          metadata: { ...virtualAccount.metadata, ...metadata },
          isActive: true
        },
        { new: true }
      );
    } else {
      // Create new virtual account
      virtualAccount = new VirtualAccount({
        user: req.user._id,
        accountNumber,
        accountName,
        bankName,
        provider,
        reference,
        status,
        metadata,
        isActive: true
      });
      await virtualAccount.save();
    }

    res.status(200).json({
      success: true,
      data: virtualAccount
    });
  } catch (error: any) {
    console.error('Error in createOrUpdateVirtualAccount:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process virtual account',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get user's virtual account
export const getUserVirtualAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const virtualAccount = await VirtualAccount.findOne({ 
      user: req.user._id,
      isActive: true
    });

    if (!virtualAccount) {
      return res.status(404).json({ 
        success: true, 
        data: { exists: false },
        message: 'No virtual account found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: virtualAccount
    });
  } catch (error: any) {
    console.error('Error in getUserVirtualAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual account',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Deactivate virtual account
export const deactivateVirtualAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const virtualAccount = await VirtualAccount.findOneAndUpdate(
      { user: req.user._id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!virtualAccount) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active virtual account found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Virtual account deactivated successfully',
      data: virtualAccount
    });
  } catch (error: any) {
    console.error('Error in deactivateVirtualAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate virtual account',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
