import mongoose, { type HydratedDocument } from 'mongoose';


export interface IWishlist {
    user: string;
    products: Array<string>;
}

export type WishlistDocument = HydratedDocument<IWishlist>;

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "User is required"],
            trim: true,
            ref: "User"
        },
        products: {
            type: [mongoose.Schema.Types.ObjectId],
            required: [true, "Products is required"],
            trim: true,
            ref: "Product"
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;