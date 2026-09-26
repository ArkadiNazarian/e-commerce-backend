import { Router } from 'express'
import { getAllUsers, getUser, updateUserInfo, updateUserRole } from '../controller/user.controller.js'
import { adminProtectedRoute, protectedRoute } from '../controller/auth.controller.js'

const userRoute = Router()

userRoute.route('/me').get(protectedRoute, getUser)
userRoute.route('/me/update-role').patch(protectedRoute, updateUserRole)
userRoute.route('/me/update-user-info').patch(protectedRoute, updateUserInfo)
userRoute.route('/all').get(protectedRoute, adminProtectedRoute, getAllUsers)

export default userRoute