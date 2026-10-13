import { Router } from 'express'
import { sendMessage } from '../controller/bot.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const botRoute = Router()

botRoute.route('/sendMessage').post(protectedRoute, sendMessage)

export default botRoute