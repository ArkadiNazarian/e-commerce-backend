import type { Request, Response } from 'express'
import { handleDbError } from '../utils/dbError.js'
import Cart from '../model/cart.model.js'
import Product from '../model/product.model.js'

export const addToCart = async (req: Request, res: Response) => {
    try {
        const { product, quantity } = req.body

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const isItemAvailable = await Product.findOne({ _id: product })

        if (!isItemAvailable) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            })
        }

        if (isItemAvailable.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Item out of stock'
            })
        }

        const getUserCart = await Cart.findOne({ user: req.user._id })

        if (!getUserCart) {

            if (quantity < 1) {
                res.status(400).json({
                    success: false,
                    message: 'Quantity must be greater than 0'
                })
                return
            }

            const newCart = await Cart.create({
                user: req.user._id,
                items: [{
                    product: product,
                    quantity
                }]
            })

            res.status(201).json({
                success: true,
                data: newCart
            })

        } else {

            let items = getUserCart.items

            const itemIndex = items.find(item => item.product?.toString() === product)

            if (itemIndex) {
                itemIndex.quantity += quantity

                if (itemIndex.quantity && (itemIndex.quantity < 0)) {
                    res.status(400).json({
                        success: false,
                        message: 'Quantity must be greater than 0'
                    })
                    return
                }

                if (itemIndex.quantity === 0 && items.length === 0) {
                    deleteCart(req, res)
                    return
                }

                if (itemIndex.quantity === 0) {
                    const filter = items.filter(item => item.product?.toString() !== product)

                    items = filter as typeof items
                }

                const updatedCart = await Cart.findByIdAndUpdate(getUserCart._id, { items }, { new: true, validateBeforeSave: true })

                res.status(200).json({
                    success: true,
                    data: updatedCart
                })
            } else {

                if (quantity < 1) {
                    res.status(400).json({
                        success: false,
                        message: 'Quantity must be greater than 0'
                    })
                    return
                }

                const newCart = await Cart.findByIdAndUpdate(getUserCart._id, { items: [...items, { product: product, quantity }] }, { new: true, validateBeforeSave: true })
                res.status(200).json({
                    success: true,
                    data: newCart
                })
            }

        }


    } catch (error) {
        handleDbError(error, res)
    }

}

export const getCart = async (req: Request, res: Response) => {
    try {
        const { user } = req
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }
        const cart = await Cart.findOne({ user: user._id })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            })
        }
        res.status(200).json({
            success: true,
            data: cart
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const deleteCart = async (req: Request, res: Response) => {
    try {
        const { user } = req
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }
        const cart = await Cart.findOneAndDelete({ user: user._id })

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Cart deleted successfully'
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const removeItemFromCart = async (req: Request, res: Response) => {
    try {
        const { product } = req.body

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const cart = await Cart.findOne({ user: req.user._id })

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            })
        }

        let items = cart.items

        const isProductInCart = items.find(item => item.product?.toString() === product)

        if (!isProductInCart) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart'
            })
        }

        const itemIndex = items.filter(item => item.product?.toString() !== product)

        if (itemIndex.length === 0) {
            deleteCart(req, res)
            return
        }

        const updatedCart = await Cart.findByIdAndUpdate(cart._id, { $pull: { items: { product: product } } }, { new: true, validateBeforeSave: true })

        res.status(200).json({
            success: true,
            data: updatedCart
        })
    } catch (error) {
        handleDbError(error, res)
    }
}