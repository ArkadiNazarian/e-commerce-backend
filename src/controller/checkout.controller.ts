import type { Request, Response } from 'express'
import Order, { OrderStatus } from '../model/order.model.js'
import { handleDbError } from '../utils/dbError.js'
import Product from '../model/product.model.js'
import Cart from '../model/cart.model.js'
import Address from '../model/address.model.js'

export const createOrder = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const getCart = await Cart.findOne({ user: req.user._id })

        if (!getCart || getCart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            })
        }

        const isOrderExist = await Order.findOne({ user: req.user._id })


        const orderItems = await Promise.all(
            getCart.items.map(async (item: any) => {
                const product = await Product.findById(item.product)
                if (!product) throw new Error('Product not found')

                const quantity = item.quantity ?? 1
                const unitPrice = product.price

                return {
                    product: product._id,
                    name: product.name,
                    unit_price: unitPrice,
                    quantity,
                    total_price: unitPrice * quantity,
                }
            })
        )

        if (isOrderExist) {

            const updatedOrder = await Order.findByIdAndUpdate(isOrderExist._id, {
                items: orderItems,
                total_price: orderItems.reduce((acc, item) => acc + item.total_price, 0),
                status: OrderStatus.PENDING
            }, { new: true})

           return res.status(200).json({
                success: true,
                data: updatedOrder
            })

            

        }


        const order = await Order.create({
            order_number: `ORD_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            user: req.user._id,
            items: orderItems,
            total_price: orderItems.reduce((acc, item) => acc + item.total_price, 0),
            status: OrderStatus.PENDING
        })

        res.status(201).json({
            success: true,
            data: order
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const selectShippingAddress = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        if(!req.body.addressId){
            return res.status(400).json({
                success: false,
                message: 'Address id is required'
            })
        }

        const isAddressExist = await Address.findById(req.body.addressId)

        if(!isAddressExist){
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            })
        }

        const order = await Order.findOneAndUpdate({ user: req.user._id },{
            shipping_address: req.body.shipping_address,
            shipping_price:20,
        })
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        res.status(200).json({
            success: true,
            data: order
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

