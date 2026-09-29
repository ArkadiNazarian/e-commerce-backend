import mongoose, { type HydratedDocument } from 'mongoose'

interface ICart {
    user: string;
    items: Array<{
        product: string;
        quantity: number;
    }>;
}

export type CartDocument = HydratedDocument<ICart>

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            required: [true, "User Id is required"],
            unique: true,
            ref: 'User'
        },
        items: {
            type: [{
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                quantity: Number
            }],
            required: [true, "Item is required"],
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default mongoose.model('Cart', cartSchema)