import type { Request, Response } from 'express'
import Product from '../model/product.model.js'
import { handleDbError } from '../utils/dbError.js'

export const addProduct = async (req: Request, res: Response) => {
    try {
        const { name, slug, description, price, images, category, stock, sku, rating_avg, rating_count, tags, brand } = req.body


        const product = await Product.create({
            name,
            slug,
            description,
            price,
            images,
            category,
            stock,
            sku,
            rating_avg,
            rating_count,
            tags,
            brand
        })

        res.status(201).json({
            success: true,
            data: product
        })

    } catch (error) {
        handleDbError(error, res)
    }
}

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, sort, minPrice, maxPrice, ...queries } = req.query

        if (minPrice) {
            queries.price = { $gte: minPrice }
        }

        if (maxPrice) {
            queries.price = { $lte: maxPrice }
        }

        let sortOptions: string | undefined

        if (sort) {
            const sortBy = (sort as string).split(',').join(' ')
            sortOptions = sortBy
        }

        const products = await Product.find(queries).sort(sortOptions).skip((Number(page) - 1) * Number(limit)).limit(Number(limit))

        res.status(200).json({
            success: true,
            length: products.length,
            data: products
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params
        const product = await Product.findByIdAndDelete(productId)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        res.status(200).json({
            success: true,
            data: product
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params

        const product = await Product.findByIdAndUpdate(productId, { ...req.body }, { new: true, validateBeforeSave: true })
        res.status(200).json({
            success: true,
            data: product
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const productTags = async (req: Request, res: Response) => {
    try {

        const aggregate = await Product.aggregate(
            [
                {
                    $unwind: "$tags"
                },
                {
                    $group: {
                        _id: "$tags",
                        products: { $push: "$name" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $addFields: {
                        tags: "$_id",
                    }
                },
                {
                    $project: {
                        _id: 0,
                    }
                }

            ]
        )

        res.status(200).json({
            success: true,
            data: aggregate
        })

    } catch (error) {
        handleDbError(error, res)
    }
}