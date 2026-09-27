import type { Request, Response } from 'express'
import Category from '../model/category.model.js'

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

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
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
       
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
