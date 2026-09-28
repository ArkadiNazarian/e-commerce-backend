import type { Request, Response } from 'express'
import Category from '../model/category.model.js'
import { handleDbError } from '../utils/dbError.js'
import Product from '../model/product.model.js'

export const addCategory = async (req: Request, res: Response) => {
    try {
        const { name, slug, description, image, parent_id } = req.body

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            parent_id
        })

        res.status(201).json({
            success: true,
            data: category
        })

    } catch (error) {
        handleDbError(error, res)
    }
}

export const getCategory = async (req: Request, res: Response) => {
    try {

        const slug = req.params.slug as string

        const category = await Category.findOne({ slug })

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        res.status(200).json({
            success: true,
            data: category
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const getCategoryById = async (req: Request, res: Response) => {
    try {

        const categoryId = req.params.categoryId as string

        const category = await Category.findById(categoryId)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        res.status(200).json({
            success: true,
            data: category
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { name, slug, description, image, parent_id } = req.body
        const category = await Category.findOneAndUpdate({ slug }, { name, slug, description, image, parent_id }, { new: true, validateBeforeSave: true })
        res.status(200).json({
            success: true,
            data: category
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const deleteCategoryById = async (req: Request, res: Response) => {
    try {

        const categoryId = req.params.categoryId as string

        const childrens = await Category.find({ parent_id: categoryId })

        if (childrens.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Category has childrens'
            })
        }

        const category = await Category.findByIdAndDelete(categoryId)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        res.status(200).json({
            success: true,
            data: category
        })
    } catch (error) {
        handleDbError(error, res)
    }
}

export const getCategoryProducts = async (req: Request, res: Response) => {
    try {

        const categoryId = req.params.categoryId as string
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

        const products = await Product.find({ category: categoryId, ...queries }).sort(sortOptions).skip((Number(page) - 1) * Number(limit)).limit(Number(limit))

        if (!products) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        res.status(200).json({
            success: true,
            length: products.length,
            data: products
        })
        
    } catch (error) {
        handleDbError(error, res)
    }
}