import { Router } from 'express'
import { deleteOrder, getOrder, getOrders } from '../controller/order.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const orderRouter = Router()

orderRouter.route('/get').get(protectedRoute, getOrders)
orderRouter.route('/:orderId').get(protectedRoute, getOrder)
orderRouter.route('/:orderId/delete').delete(protectedRoute, deleteOrder)

export default orderRouter

