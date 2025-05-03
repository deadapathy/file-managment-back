import { User } from '../models/User.js'
import bcrypt from 'bcryptjs'
import { createToken } from '../auth/auth.js'

export const userService = {
	async register(username: string, password: string) {
		const existing = await User.findOne({ username })
		if (existing) throw new Error('User already exists')
		if (!password || !username) throw new Error('Fields cannot be empty')

		const hashed = await bcrypt.hash(password, 10)
		const user = await User.create({ username, password: hashed })

		const token = createToken(user)
		return { id: user._id, username: user.username, token }
	},

	async login(username: string, password: string) {
		const user = await User.findOne({ username })
		if (!user) throw new Error('User not found')

		const isValid = await bcrypt.compare(password, user.password)
		if (!isValid) throw new Error('Invalid password')

		const token = createToken(user)
		return { id: user._id, username: user.username, token }
	},
}
