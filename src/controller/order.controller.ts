import type { Request, Response } from 'express'
import Order from '../model/order.model.js'
import { handleDbError } from '../utils/dbError.js'

export const getOrders = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const orders = await Order.find({ user: req.user._id })
        res.status(200).json({
            success: true,
            length: orders.length,
            data: orders
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const getOrder = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const order = await Order.findById(req.params.orderId)

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

export const deleteOrder = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const order = await Order.findByIdAndDelete(req.params.orderId)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        res.status(200).json({
            success: true,
            data: null
        })
    } catch (error) {
        handleDbError(error, res)
    }
}