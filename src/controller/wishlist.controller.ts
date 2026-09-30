import Wishlist from "../model/wishlist.model.js";
import type { Request, Response } from "express";
import { handleDbError } from "../utils/dbError.js";
import Product from "../model/product.model.js";

export const addProductToWishlist = async (req: Request, res: Response) => {
    try {
        const { product } = req.body;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const checkProduct = await Product.findOne({ _id: product })

        if (!checkProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {

            const createWishList = await Wishlist.create({
                user: req.user._id,
                products: [product]
            })

            res.status(201).json({
                success: true,
                data: createWishList
            })

        } else {


            const updatedWishlist = await Wishlist.findOneAndUpdate(
                { user: req.user._id },
                { $addToSet: { products: product } },
                { new: true, runValidators: true }
            );
            res.status(200).json({
                success: true,
                data: updatedWishlist
            });
        }
    } catch (error) {
        return handleDbError(error, res);
    }

};

export const getWishlist = async (req: Request, res: Response) => {
    try {
        const { user } = req
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }
        const wishlist = await Wishlist.findOne({ user: user._id })
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            })
        }
        res.status(200).json({
            success: true,
            data: wishlist
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const deleteWishlist = async (req: Request, res: Response) => {
    try {
        const { user } = req
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }
        const wishlist = await Wishlist.findOneAndDelete({ user: user._id })

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Wishlist deleted successfully'
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const removeItemFromWishlist = async (req: Request, res: Response) => {
    try {
        const { product } = req.body

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            })
        }

        const isProductInWishlist = wishlist.products.find(item => item.toString() === product)

        if (!isProductInWishlist) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            })
        }
        
        if(wishlist.products.length === 1) {
            deleteWishlist(req, res)
            return
        }

        const updateWishlist = await Wishlist.findByIdAndUpdate(wishlist._id, { $pull: { products: product } }, { new: true, validateBeforeSave: true })


        res.status(200).json({
            success: true,
            data: updateWishlist
        })
    } catch (error) {
        handleDbError(error, res)
    }
}