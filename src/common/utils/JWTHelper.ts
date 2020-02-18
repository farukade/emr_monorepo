import * as jwt from 'jsonwebtoken';
import { appService } from '../../app.service';

export class JWTHelper {
  /**
   *
   * @param {string} username
   */

  static async createToken(username: string) {
    const expiresIn = '48h'; // expired in 2days
    const secretKey = appService.getValue('JWT_TOKEN');
    const user = { username };
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
      jwt.verify(token, secretKey, function(err, decoded) {
        if (err) {
          reject(false);
        }
        return true;
      });
    });
  }
}
