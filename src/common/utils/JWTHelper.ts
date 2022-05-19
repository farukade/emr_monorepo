import * as jwt from 'jsonwebtoken';
import { configService } from '../../config.service';

export class JWTHelper {
	/**
	 * @param {any} user
	 */
	static async createToken(user) {
		const expiresIn = '48h'; // expired in 2days
		const secretKey = configService.getValue('JWT_TOKEN');
		const token = jwt.sign(user, secretKey, { expiresIn });
		return { expires_in: expiresIn, token };
	}

	/**
	 * @param id
	 * @param {String} token
	 */
	static verifyToken(id, token) {
		return new Promise((resolve, reject) => {
			const secretKey = configService.getValue('JWT_TOKEN');
			jwt.verify(token, secretKey, (err, decoded) => {
				if (err) {
					reject(false);
				}
				return true;
			});
		});
	}

	/**
	 * @param token
	 */

	static async getUser(token: string) {
		try {
			const user = await JWTHelper.verifyToken(token, true);
			return user;
		} catch (err) {
			return false;
		}
	}
}
