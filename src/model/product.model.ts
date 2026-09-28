import mongoose,{ type HydratedDocument }  from 'mongoose';

export interface Product {
    name: string;
    slug: string;
    description: string;
    price: number;
    images: Array<string>;
    category: string;
    stock: number;
    sku: string;
    rating_avg: number;
    rating_count: number;
    is_active: boolean;
    tags: Array<string>;
    brand: string;
}

export type ProductDocument = HydratedDocument<Product>;

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
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
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price must be greater than 0"]
        },
        images: {
            type: [String],
            required: [true, "Images is required"],
            trim: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Category is required"],
            trim: true
        },
        stock: {
            type: Number,
            required: [true, "Stock is required"],
            min: [0, "Stock must be greater than 0"]
        },
        sku: {
            type: String,
            required: [true, "Sku is required"],
            trim: true
        },
        rating_avg: {
            type: Number,
            required: [true, "Rating avg is required"],
            min: [0, "Rating avg must be greater than 0"]
        },
        rating_count: {
            type: Number,
            required: [true, "Rating count is required"],
            min: [0, "Rating count must be greater than 0"]
        },
        is_active: {
            type: Boolean,
            default: true
        },
        tags: {
            type: [String],
            required: [true, "Tags is required"],
            trim: true
        },
        brand: {
            type: String,
            required: [true, "Brand is required"],
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;