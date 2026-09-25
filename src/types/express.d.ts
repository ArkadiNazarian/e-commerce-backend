import type { UserDocument } from '../model/user.model.js';

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
        }
    }
}

export {};