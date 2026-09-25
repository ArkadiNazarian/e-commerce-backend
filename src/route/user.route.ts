import { Router } from 'express'
import { getUser } from '../controller/user.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const userRoute = Router()

userRoute.route('/me').get(protectedRoute, getUser)

export default userRoute