import { Router } from 'express'
import { createOrder, selectShippingAddress } from '../controller/checkout.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const checkoutRoute = Router()


checkoutRoute.route('/order/add').post(protectedRoute, createOrder)
checkoutRoute.route('/shipping-address').patch(protectedRoute, selectShippingAddress)

export default checkoutRoute