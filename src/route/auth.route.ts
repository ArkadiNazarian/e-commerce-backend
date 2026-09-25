import { Router } from 'express'
import { forgetPassword, login, refreshToken, resetPassword, signup } from '../controller/auth.controller.js'

const authRoute = Router()

authRoute.route('/signup').post(signup)
authRoute.route('/login').post(login)
authRoute.route('/forget-password').post(forgetPassword)
authRoute.route('/reset-password/:resetPasswordToken').post(resetPassword)
authRoute.route('/refresh-token').post(refreshToken)

export default authRoute