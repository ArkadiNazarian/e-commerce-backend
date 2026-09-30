import { Router } from 'express';
import { addProductToWishlist, deleteWishlist, getWishlist, removeItemFromWishlist } from '../controller/wishlist.controller.js';
import { protectedRoute } from '../controller/auth.controller.js';


const wishlistRoute = Router();

wishlistRoute.route('/add').post(protectedRoute, addProductToWishlist);
wishlistRoute.route('/get').get(protectedRoute, getWishlist);
wishlistRoute.route('/delete').delete(protectedRoute, deleteWishlist);
wishlistRoute.route('/remove-item').patch(protectedRoute, removeItemFromWishlist);

export default wishlistRoute;