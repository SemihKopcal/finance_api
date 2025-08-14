import { User, IUser } from './entities/user.model';
import bcrypt from 'bcrypt';

export class UserService {
  static async getUserProfile(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  static async updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    return User.findByIdAndUpdate(userId, updateData, { new: true });
  }
}
