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

        const getUserCart = await Cart.findOne({ user: req.user._id })

        if (!getUserCart) {

            const newCart = await Cart.create({
                user: req.user._id,
                items: [{
                    product: product,
                    quantity
                }]
            })

            res.status(201).json({
                success: true,
                data: newCart.items
            })

        } else {

            const items = getUserCart.items

            const itemIndex = items.find(item => item.product?.toString() === product)

            if (itemIndex) {
                itemIndex.quantity += quantity
                const updatedCart = await Cart.findByIdAndUpdate(getUserCart._id, { items }, { new: true, validateBeforeSave: true })

                res.status(200).json({
                    success: true,
                    data: updatedCart
                })
            } else {
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