import mongoose, { type HydratedDocument } from 'mongoose'

export interface ICategory {
    name: string;
    slug: string;
    description: string;
    image: string;
    parent_id: string;
}

export type CategoryDocument = HydratedDocument<ICategory>;

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            unique: true
        },
        slug: {
            type: String,
            required: [true, "Slug is required"],
            trim: true,
            unique: true
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true
        },
        image: {
            type: String,
            required: [true, "Image is required"],
            trim: true
        },
        parent_id: {
            type: mongoose.Schema.Types.ObjectId ,
            ref: 'Category',
            default: null,
            index: true
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default mongoose.model('Category', categorySchema)