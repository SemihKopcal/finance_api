import { AuthService } from '../auth.service';
import { User, IUser } from '../../user/entities/user.model';
import bcrypt from 'bcrypt';

jest.mock('../../user/entities/user.model');
jest.mock('bcrypt');

const mockedUser = User as jest.Mocked<typeof User>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user if email does not exist', async () => {
      mockedUser.findOne.mockResolvedValue(null as any);
      mockedBcrypt.hash.mockResolvedValue('hashed-password');

      const saveMock = jest.fn().mockResolvedValue({} as IUser);
      mockedUser.mockImplementation(() => ({ save: saveMock } as any));

      const user = await AuthService.register('Test', 'test@example.com', 'pass123');

      expect(mockedUser.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('pass123', 10);
      expect(saveMock).toHaveBeenCalled();
      expect(user).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      mockedUser.findOne.mockResolvedValue({ _id: '1' } as IUser);

      await expect(AuthService.register('Test', 'test@example.com', 'pass123')).rejects.toMatchObject({
        code: 'EMAIL_ALREADY_EXISTS',
        statusCode: 409,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if email and password match', async () => {
      const mockUser: IUser = { password: 'hashed-pass' } as IUser;
      mockedUser.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await AuthService.validateUser('test@example.com', 'pass123');

      expect(result).toBe(mockUser);
    });

    it('should return null if user not found', async () => {
      mockedUser.findOne.mockResolvedValue(null as any);
      const result = await AuthService.validateUser('test@example.com', 'pass123');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      mockedUser.findOne.mockResolvedValue({ password: 'hashed-pass' } as IUser);
      mockedBcrypt.compare.mockResolvedValue(false);
      const result = await AuthService.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });
});
