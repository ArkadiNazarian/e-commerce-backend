import { Router } from 'express'
import { addCategory, getCategory } from '../controller/category.controller.js'
import { adminProtectedRoute, protectedRoute } from '../controller/auth.controller.js'

const categoryRoute = Router()

categoryRoute.route('/add').post(protectedRoute, adminProtectedRoute, addCategory)
categoryRoute.route('/:slug').get(protectedRoute, adminProtectedRoute, getCategory)

export default categoryRoute