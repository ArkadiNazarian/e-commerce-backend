import type { Request, Response } from 'express'
import User from '../model/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const signup = async (req: Request, res: Response) => {
    try {

        const hashedPassword = await bcrypt.hash(req.body.password, 12)

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role
        })

        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY as string, {
            expiresIn: 3600
        })

        res.cookie('token', token, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict'
        })

        res.status(201).json({
            success: true,
            token,
            data: newUser
        })


    } catch (error) {

        const err = error as Error

        res.status(500).json({
            success: false,
            message: err.message
        })
    }

}

export const login = async (req: Request, res: Response) => {
    try {

        const user = await User.findOne({ email: req.body.email }).select("+password")

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'No user found with this email'
            })
            return
        }

        const comparePassword = await bcrypt.compare(req.body.password,user.password)

        if (!comparePassword) {
            res.status(200).json({
                success:false,
                messsage:"Invalid password"
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY as string, {
            expiresIn: 3600
        })

        res.cookie('token', token, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict'
        })

        res.status(201).json({
            success: true,
            token,
            data: user
        })


    } catch (error) {

        const err = error as Error

        res.status(500).json({
            success: false,
            message: err.message
        })
    }

}