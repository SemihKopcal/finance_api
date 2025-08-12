import { User, IUser } from './auth.model';
import bcrypt from 'bcrypt';

export class AuthService {
  static async register(name: string, email: string, password: string): Promise<IUser> {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email already in use');

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

  static async getUserProfile(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }
}