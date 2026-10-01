import mongoose, { type HydratedDocument } from 'mongoose';

export enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}

export enum PaymentMethod {
    COD = "COD",
    CARD = "CARD"
}

export enum PaymentStatus {
    PAID = "PAID",
    NOTPAID = "NOTPAID"
}

export interface Order {
    order_number: string;
    user: string;
    items: Array<{
        product: string;
        quantity: number;
        total_price: number;
        unit_price: number;
        name: string;
    }>;
    shipping_address: string | null;
    total_price: number;
    shipping_price: number | null;
    discount_price: number | null;
    status: OrderStatus;
    payment_method: PaymentMethod | null;
    payment_status: PaymentStatus;
    tracking_number: string | null;
}

export type OrderDocument = HydratedDocument<Order>;

const orderSchema = new mongoose.Schema(
    {
        order_number: {
            type: String,
            required: [true, "Order number is required"],
            trim: true,
            unique: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "User is required"],
            trim: true
        },
        items: {
            type: [
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: [true, "Product is required"],
                        trim: true
                    },
                    quantity: {
                        type: Number,
                        required: [true, "Quantity is required"],
                        min: [1, "Quantity must be greater than 0"]
                    },
                    total_price: {
                        type: Number,
                        required: [true, "Total price is required"],
                        min: [0, "Price must be greater than 0"]
                    },
                    unit_price: {
                        type: Number,
                        required: [true, "Unit price is required"],
                        min: [0, "Unit price must be greater than 0"]
                    },
                    name: {
                        type: String,
                        required: [true, "Name is required"],
                        trim: true
                    }
                }
            ],
            required: [true, "Items is required"],
            trim: true
        },
        shipping_address: {
            type: String,
           
            trim: true,
            default: null
        },
        total_price: {
            type: Number,
            required: [true, "Total price is required"],
            min: [0, "Total price must be greater than 0"]
        },
        shipping_price: {
            type: Number,
            
            min: [0, "Shipping price must be greater than 0"],
            default: 0
        },
        discount_price: {
            type: Number,
            
            min: [0, "Discount price must be greater than 0"],
            default: null
        },
        status: {
            type: String,
            required: [true, "Status is required"],
            trim: true
        },
        payment_method: {
            type: String,
           
            trim: true,
            default: null
        },
        payment_status: {
            type: String,
            required: [true, "Payment status is required"],
            trim: true,
            default:PaymentStatus.NOTPAID
        },
        tracking_number: {
            type: String,
            
            trim: true,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;