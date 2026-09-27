import { Router } from 'express'
import { addCategory, deleteCategoryById, getCategory, getCategoryById } from '../controller/category.controller.js'
import { adminProtectedRoute, protectedRoute } from '../controller/auth.controller.js'

const categoryRoute = Router()

categoryRoute.route('/add').post(protectedRoute, adminProtectedRoute, addCategory)
categoryRoute.route('/slug/:slug').get(protectedRoute, adminProtectedRoute, getCategory)
categoryRoute.route('/id/:categoryId').get(protectedRoute, adminProtectedRoute, getCategoryById)
categoryRoute.route('/:categoryId/delete').delete(protectedRoute, adminProtectedRoute, deleteCategoryById)

export default categoryRoute