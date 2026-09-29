import { Router } from 'express'
import { addToCart } from '../controller/cart.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const cartRoute = Router()

cartRoute.route('/add').post(protectedRoute,addToCart)

export default cartRoute