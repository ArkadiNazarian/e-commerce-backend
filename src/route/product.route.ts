import { Router } from 'express'
import { addProduct, getProducts } from '../controller/product.controller.js'
import { adminProtectedRoute, protectedRoute } from '../controller/auth.controller.js'

const productRoute = Router()

productRoute.route('/add').post(protectedRoute, adminProtectedRoute, addProduct)
productRoute.route('/all').get(protectedRoute, getProducts)

export default productRoute