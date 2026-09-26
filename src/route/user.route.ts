import { Router } from 'express'
import { getUser, updateUserInfo, updateUserRole } from '../controller/user.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const userRoute = Router()

userRoute.route('/me').get(protectedRoute, getUser)
userRoute.route('/me/update-role').patch(protectedRoute, updateUserRole)
userRoute.route('/me/update-user-info').patch(protectedRoute, updateUserInfo)

export default userRoute