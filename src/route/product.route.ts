import { Router } from 'express'
import { addProduct, deleteProduct, getProductById, getProducts, productTags, updateProduct } from '../controller/product.controller.js'
import { adminProtectedRoute, protectedRoute } from '../controller/auth.controller.js'

const productRoute = Router()

productRoute.route('/add').post(protectedRoute, adminProtectedRoute, addProduct)
productRoute.route('/all').get(protectedRoute, getProducts)
productRoute.route('/product-tags').get(protectedRoute, productTags)
productRoute.route('/:productId').delete(protectedRoute, adminProtectedRoute, deleteProduct)
productRoute.route('/:productId').get(protectedRoute, getProductById)
productRoute.route('/:productId/update').patch(protectedRoute, adminProtectedRoute, updateProduct)


export default productRoute