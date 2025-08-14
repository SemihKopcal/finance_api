import { UserService } from '../user.service';
import { User, IUser } from '../entities/user.model';
import bcrypt from 'bcrypt';

jest.mock('../entities/user.model');
jest.mock('bcrypt');

const mockedUser = User as jest.Mocked<typeof User>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt> & {
  hash: jest.MockedFunction<typeof bcrypt.hash>;
};

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user if found', async () => {
      const mockUser = { _id: '1', name: 'Test' } as IUser;
      mockedUser.findById.mockResolvedValue(mockUser);

      const result = await UserService.getUserProfile('1');

      expect(result).toBe(mockUser);
    });

    it('should return null if user not found', async () => {
      mockedUser.findById.mockResolvedValue(null);
      const result = await UserService.getUserProfile('1');
      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user without password', async () => {
      const mockUser = { _id: '1', name: 'Updated' } as IUser;
      mockedUser.findByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await UserService.updateUserProfile('1', { name: 'Updated' });

      expect(mockedUser.findByIdAndUpdate).toHaveBeenCalledWith('1', { name: 'Updated' }, { new: true });
      expect(result).toBe(mockUser);
    });

    it('should hash password before updating', async () => {
      mockedBcrypt.hash.mockResolvedValue('hashed-new-pass');
      const mockUser = { _id: '1', name: 'Test' } as IUser;
      mockedUser.findByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await UserService.updateUserProfile('1', { password: 'newpass' });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(mockedUser.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { password: 'hashed-new-pass' },
        { new: true }
      );
      expect(result).toBe(mockUser);
    });
  });
});
