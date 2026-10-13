import type { Request, Response } from 'express'
import { askQuestion } from '../redis/productVectorSearch.js';

export const sendMessage = async (req: Request, res: Response) => {
    try {

        const { message } = req.body

        const results = await askQuestion(message);
        console.log(results);

        res.status(200).json({
            success: true,
            data: results
        })

    } catch (error) {
        console.log(error)
    }
}