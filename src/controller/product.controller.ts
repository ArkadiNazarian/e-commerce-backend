import type { Request, Response } from 'express'
import Product from '../model/product.model.js'

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

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
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
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
