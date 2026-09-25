import mongoose, { type HydratedDocument } from 'mongoose'
import validator from 'validator'

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    phone?: string | null;
    passwordChangedAt?: Date | null;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
    refreshToken: string;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            validate: [validator.isEmail, "Email is invalid"],
            trim: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false
        },
        role: {
            type: String,
            required: [true, "Role is required"],
            enum: ["admin", "user"],
            default: "user"
        },
        phone: {
            type: String,
            trim: true
        },
        passwordChangedAt: {
            type: Date,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        refreshToken: {
            required: true,
            type: String,
            select: false
        },

    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default mongoose.model('User', userSchema)