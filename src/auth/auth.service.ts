import { User, IUser } from '../user/entities/user.model';
import bcrypt from 'bcrypt';

export class AuthService {
  static async register(name: string, email: string, password: string): Promise<IUser> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Bu email adresi zaten kullanımda');
      (error as any).statusCode = 409;
      (error as any).code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    return user;
  }

  static async validateUser(email: string, password: string): Promise<IUser | null> {
    const user = await User.findOne({ email });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }
}
