import { Router } from 'express'
import { addToCart, deleteCart, getCart, removeItemFromCart } from '../controller/cart.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const cartRoute = Router()

cartRoute.route('/add').post(protectedRoute, addToCart)
cartRoute.route('/get').get(protectedRoute, getCart)
cartRoute.route('/delete').delete(protectedRoute, deleteCart)
cartRoute.route('/:productId/remove-item').delete(protectedRoute, removeItemFromCart)

export default cartRoute