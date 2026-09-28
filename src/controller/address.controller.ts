import type { Request, Response } from 'express';
import Address from '../model/address.model.js';
import { handleDbError } from '../utils/dbError.js';

export const addAddress = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        const address = await Address.create({
            user_id: req.user._id,
            label: req.body.label,
            phone: req.body.phone,
            line1: req.body.line1,
            line2: req.body.line2,
            city: req.body.city,
            state: req.body.state,
            postalCode: req.body.postalCode,
            country: req.body.country,
            is_default: req.body.is_default,
        });

        return res.status(201).json({
            success: true,
            data: address,
        });

    } catch (error) {
        return handleDbError(error, res);
    }
};

export const getUserAddresses = async (req: Request, res: Response) => {
    try {

        const { page = 1, limit = 10 } = req.query;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        const address = await Address.find({ user_id: req.user._id }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'No address found with this user id',
            });
        }

        return res.status(200).json({
            success: true,
            data: address,
        });

    } catch (error) {
        return handleDbError(error, res);
    }
};

export const getAddressById = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        const address = await Address.findById(req.params.addressId)

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'No address found with this id',
            });
        }

        return res.status(200).json({
            success: true,
            data: address,
        });

    } catch (error) {
        return handleDbError(error, res);
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        const address = await Address.findById(req.params.addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'No address found with this id',
            });
        }

        const updatedAddress = await Address.findByIdAndUpdate(req.params.addressId, {

            ...req.body

        }, { new: true, runValidators: true });

        return res.status(200).json({
            success: true,
            data: updatedAddress,
        });

    } catch (error) {
        return handleDbError(error, res);
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        const deletedAddress = await Address.findByIdAndDelete(req.params.addressId);

        if (!deletedAddress) {
            return res.status(404).json({
                success: false,
                message: 'No address found with this id',
            });
        }

        return res.status(200).json({
            success: true,
            data: null,
        });

    } catch (error) {
        return handleDbError(error, res);
    }
};