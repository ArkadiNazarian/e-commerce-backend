import type { Request, Response } from 'express';
import User from '../model/user.model.js';

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email',
            });
        }
        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};