import { Router } from 'express'
import { forgetPassword, login, resetPassword, signup } from '../controller/auth.controller.js'

const authRoute = Router()

authRoute.route('/signup').post(signup)
authRoute.route('/login').post(login)
authRoute.route('/forget-password').post(forgetPassword)
authRoute.route('/reset-password/:resetPasswordToken').post(resetPassword)

export default authRoute