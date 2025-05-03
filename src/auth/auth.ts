import jwt from 'jsonwebtoken'
import { UserDocument } from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'

export const createToken = (user: UserDocument): string => {
	return jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
		expiresIn: '1d',
	})
}

export const verifyToken = (token: string) => {
	try {
		return jwt.verify(token, JWT_SECRET)
	} catch {
		return null
	}
}
