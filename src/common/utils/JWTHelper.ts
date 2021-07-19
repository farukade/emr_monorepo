import * as jwt from 'jsonwebtoken';
import { appService } from '../../app.service';
import { User } from '../../modules/auth/entities/user.entity';

export class JWTHelper {
  /**
   *
   * @param {any} user
   */

  static async createToken(user) {
    const expiresIn = '48h'; // expired in 2days
    const secretKey = appService.getValue('JWT_TOKEN');
    const token = jwt.sign(user, secretKey, { expiresIn });
    return { expires_in: expiresIn, token };
  }

  /**
   *
   * @param {String} token
   * @param {Callback} callback
   */
  static verifyToken(id, token) {
    return new Promise((resolve, reject) => {
      const secretKey = appService.getValue('JWT_TOKEN');
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          reject(false);
        }
        return true;
      });
    });
  }

  /**
   *
   * @param {string} user
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
