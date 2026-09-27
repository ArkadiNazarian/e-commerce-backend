import { Router } from 'express'
import { addAddress, deleteAddress, getAddressById, getUserAddresses, updateAddress } from '../controller/address.controller.js'
import { protectedRoute } from '../controller/auth.controller.js'

const addressRoute = Router()

addressRoute.route('/add').post(protectedRoute, addAddress)
addressRoute.route('/user-addresses').get(protectedRoute, getUserAddresses)
addressRoute.route('/:addressId').get(protectedRoute, getAddressById)
addressRoute.route('/:addressId').patch(protectedRoute, updateAddress)
addressRoute.route('/:addressId').delete(protectedRoute, deleteAddress)

export default addressRoute