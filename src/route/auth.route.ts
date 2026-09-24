import { Router } from 'express'
import { login, signup } from '../controller/auth.controller.js'

const authRoute = Router()

authRoute.route('/signup').post(signup)
authRoute.route('/login').post(login)

export default authRoute