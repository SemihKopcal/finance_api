import { AuthService } from '../auth.service';
import { User } from '../entities/user.model';
import bcrypt from 'bcrypt';

jest.mock('../entities/user.model');
jest.mock('bcrypt');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user if email does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      const saveMock = jest.fn().mockResolvedValue({});
      (User as unknown as jest.Mock).mockImplementation(() => ({ save: saveMock }));

      const user = await AuthService.register('Test', 'test@example.com', 'pass123');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
      expect(saveMock).toHaveBeenCalled();
      expect(user).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ _id: '1' });

      await expect(AuthService.register('Test', 'test@example.com', 'pass123'))
        .rejects
        .toMatchObject({
          code: 'EMAIL_ALREADY_EXISTS',
          statusCode: 409,
        });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('login', () => {
    it('should return user if email and password match', async () => {
      const mockUser = { password: 'hashed-pass' };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.validateUser('test@example.com', 'pass123');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('pass123', 'hashed-pass');
      expect(result).toBe(mockUser);
    });

    it('should return null if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.validateUser('test@example.com', 'pass123');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ password: 'hashed-pass' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await AuthService.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('should return user if found', async () => {
      const mockUser = { _id: '1', name: 'Test' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.getUserProfile('1');

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(result).toBe(mockUser);
    });

    it('should return null if user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.getUserProfile('1');
      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user without password', async () => {
      const mockUser = { _id: '1', name: 'Updated' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.updateUserProfile('1', { name: 'Updated' });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('1', { name: 'Updated' }, { new: true });
      expect(result).toBe(mockUser);
    });

    it('should hash password before updating', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-pass');
      const mockUser = { _id: '1', name: 'Test' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.updateUserProfile('1', { password: 'newpass' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { password: 'hashed-new-pass' },
        { new: true }
      );
      expect(result).toBe(mockUser);
    });
  });
});
