import mongoose, { type HydratedDocument } from 'mongoose'

export interface IAddress {
    label: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export type AddressDocument = HydratedDocument<IAddress>;

const addressSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: [true, "Label is required"],
            trim: true
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            trim: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "User id is required"],
            index: true
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true
        },
        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true
        },
        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true
        },
        line1: {
            type: String,
            required: [true, "Line1 is required"],
            trim: true
        },
        lin2: {
            type: String,
            trim: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default mongoose.model('Address', addressSchema)