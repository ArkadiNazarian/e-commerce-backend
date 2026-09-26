import type { Request, Response, NextFunction } from 'express'
import User from '../model/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const protectedRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token as string

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token is required'
            })
            return
        }

        const decodedToken = jwt.verify(token, process.env.SECRET_KEY as string) as { id: string }

        const user = await User.findById(decodedToken.id)

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Token is invalid'
            })
            return
        }

        (req as any).user = user

        next()

    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ success: false, message: 'Token expired' })
            return
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const adminProtectedRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = req.user

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Token is invalid'
            })
            return
        }

        if(user.role !== 'admin') {
            res.status(401).json({
                success: false,
                message: 'You are not authorized to access this route',
            })
            return
        }

        (req as any).user = user

        next()

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const signup = async (req: Request, res: Response) => {
    try {

        if (!req.body.name || !req.body.email || !req.body.password) {
            res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            })
            return
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12)

        const newUser = await new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role,
        })

        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY as string, {
            expiresIn: 3600
        })

        const refreshToken = jwt.sign({ id: newUser._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: 7 * 24 * 60 * 60 * 1000
        })

        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')


        newUser.refreshToken = hashedRefreshToken

        await newUser.save()

        res.cookie('token', token, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict'
        })

        res.cookie('refreshToken', refreshToken, {
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

        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}

export const login = async (req: Request, res: Response) => {
    try {

        if (!req.body.email || !req.body.password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            })
            return
        }

        const user = await User.findOne({ email: req.body.email }).select("+password")

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'No user found with this email'
            })
            return
        }

        const comparePassword = await bcrypt.compare(req.body.password, user.password)

        if (!comparePassword) {
            res.status(200).json({
                success: false,
                messsage: "Invalid password"
            })
            return
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

        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}

export const forgetPassword = async (req: Request, res: Response) => {

    try {
        if (!req.body.email) {
            res.status(400).json({
                success: false,
                message: 'Email is required'
            })
            return
        }

        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'No user found with this email'
            })
            return
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

        const tokenExpiry = new Date(Date.now() + 3600 * 1000)

        await User.findOneAndUpdate({ email: req.body.email }, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: tokenExpiry
        }, { new: true })


        // send email

        res.status(200).json({
            success: true,
            data: {
                resetToken: rawToken
            }
        })
    }

    catch (error) {

        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}

export const resetPassword = async (req: Request, res: Response) => {
    try {

        const resetPasswordToken = req.params.resetPasswordToken as string

        if (!resetPasswordToken || !req.body.password) {
            res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            })
            return
        }

        const hashedToken = crypto.createHash('sha256').update(resetPasswordToken).digest('hex');

        const user = await User.findOne({ resetPasswordToken: hashedToken })
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'No user found with this reset token'
            })
            return
        }

        if (user.resetPasswordExpires!.getTime() < Date.now()) {
            res.status(401).json({
                success: false,
                message: 'Reset token expired'
            })
            return
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12)

        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        })

        res.status(200).json({
            success: true,
            data: null
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {

        const refreshToken = req.cookies.refreshToken as string

        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token is required'
            })
            return
        }

        const refrehToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN as string)

        if (!refrehToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token is invalid'
            })
            return
        }


        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const user = await User.findOne({ refreshToken: hashedRefreshToken })
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Refresh token is invalid'
            })
            return
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY as string, {
            expiresIn: 15 * 60 * 1000
        })

        const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: 7 * 24 * 60 * 60 * 1000
        })

        const newHashedRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex')

        await User.findByIdAndUpdate(user._id, {
            refreshToken: newHashedRefreshToken
        })


        res.cookie('token', token, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict'
        })

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict'
        })

        res.status(200).json({
            success: true,
            token,
        })

    }
    catch (error) {

        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}