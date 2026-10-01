import { Router } from 'express'
import { createOrder } from '../controller/checkout.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const checkoutRoute = Router()


checkoutRoute.route('/order/add').post(protectedRoute,createOrder)

export default checkoutRoute