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

export const updateUserRole = async (req: Request, res: Response) => {
    try {

        const { role } = req.body;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        const findAndUpdateUserRole = await User.findByIdAndUpdate(req.user.id, { role }, { new: true, runValidators: true });

        if (!findAndUpdateUserRole) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        return res.status(200).json({
            success: true,
            data: findAndUpdateUserRole,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

export const updateUserInfo = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        if(req.body.role){
            delete req.body.role
        }

        if(req.body.password){
            delete req.body.password
        }

        const findAndUpdateUserInfo = await User.findByIdAndUpdate(
            req.user.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!findAndUpdateUserInfo) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        return res.status(200).json({
            success: true,
            data: findAndUpdateUserInfo,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}