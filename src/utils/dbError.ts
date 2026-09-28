import type { Response } from 'express'
import mongoose from 'mongoose'

type DbErrorLike = Error & {
    code?: number
    keyValue?: Record<string, unknown>
    name?: string
}

/**
 * Sends a JSON response with a status code that matches the kind of
 * database error that was thrown:
 * - duplicate key (E11000)        -> 409
 * - cast error (bad id / value)   -> 400
 * - schema validation error       -> 400
 * - document not found            -> 404
 * - version conflict              -> 409
 * - connection / network issues   -> 503
 * - anything else                 -> 500 (and logs the original error)
 */
export const handleDbError = (error: unknown, res: Response): void => {
    const err = error as DbErrorLike

    // Duplicate index (E11000) -> e.g. same email/slug twice
    if (err?.code === 11000) {
        const fields = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'field'
        res.status(409).json({
            success: false,
            message: `Duplicate value for ${fields}`,
        })
        return
    }

    // Invalid ObjectId / value that failed to cast
    if (error instanceof mongoose.Error.CastError) {
        res.status(400).json({
            success: false,
            message: `Invalid value for ${error.path}: ${String(error.value)}`,
        })
        return
    }

    // Mongoose schema validation failed
    if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((e) => e.message)
        res.status(400).json({
            success: false,
            message: messages.join(', '),
        })
        return
    }

    // Query returned no document (e.g. findByIdAndDelete on missing doc)
    if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(404).json({
            success: false,
            message: 'Document not found',
        })
        return
    }

    // Concurrent modification of the same document
    if (error instanceof mongoose.Error.VersionError) {
        res.status(409).json({
            success: false,
            message: 'Document was modified by another request, please retry',
        })
        return
    }

    // Database is unreachable / selection timed out / buffering timed out
    if (
        error instanceof mongoose.Error.MongooseServerSelectionError ||
        err?.name === 'MongoNetworkError' ||
        err?.name === 'MongoServerSelectionError' ||
        err?.name === 'MongoNetworkTimeoutError' ||
        (error instanceof mongoose.Error && error.message.includes('buffering timed out'))
    ) {
        res.status(503).json({
            success: false,
            message: 'Database unavailable, please try again later',
        })
        return
    }

    // Unexpected error - log it so it is not silently swallowed
    console.error('Unexpected database error:', error)

    res.status(500).json({
        success: false,
        message: 'Internal server error',
    })
}
