// category.service.test.ts
import { CategoryService } from '../categories.service';
import { Category } from '../entities/categories.model';
import { Transaction } from '../../transactions/entities/transaction.model';

jest.mock('../entities/categories.model');
jest.mock('../../transactions/entities/transaction.model');

describe('CategoryService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDefaultCategoriesForUser', () => {
    it('should create missing default categories', async () => {
      (Category.findOne as jest.Mock).mockResolvedValueOnce(null); // first category not exists
      (Category.create as jest.Mock).mockResolvedValue({});
      // rest will "exist"
      (Category.findOne as jest.Mock).mockResolvedValue({});

      await CategoryService.createDefaultCategoriesForUser('user1');

      expect(Category.findOne).toHaveBeenCalled();
      expect(Category.create).toHaveBeenCalled();
    });

    it('should not create category if already exists', async () => {
      (Category.findOne as jest.Mock).mockResolvedValue({ _id: '123' });

      await CategoryService.createDefaultCategoriesForUser('user1');

      expect(Category.create).not.toHaveBeenCalled();
    });
  });

  describe('getDefaultCategories', () => {
    it('should return default categories array', () => {
      const result = CategoryService.getDefaultCategories();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('isDefault', true);
    });
  });

  describe('createCategory', () => {
    it('should create and save a new category', async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      (Category as unknown as jest.Mock).mockImplementation(() => ({
        save: saveMock,
      }));

      const result = await CategoryService.createCategory(
        'Test',
        'income',
        '#fff',
        'user1'
      );

      expect(Category).toHaveBeenCalledWith({
        name: 'Test',
        type: 'income',
        color: '#fff',
        userId: 'user1',
        isDefault: false,
      });
      expect(saveMock).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getAllCategory', () => {
    it('should return combined user and default categories with pagination', async () => {
      // populate mock
      const populateMock = jest
        .fn()
        .mockResolvedValue([
          {
            _id: 'u1',
            name: 'User Cat',
            userId: { name: 'User', email: 'user@test.com' },
          },
        ]);

      // mock user categories find().populate()
      (Category.find as jest.Mock).mockImplementationOnce(() => ({
        populate: () => populateMock(),
      }));

      // mock default categories find()
      (Category.find as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve([{ _id: 'd1', name: 'Default Cat', isDefault: true }])
      );

      const result = await CategoryService.getAllCategory('user1', 1, 10);

      // Beklenen sonuç: default + user kategorileri
      expect(result).toEqual(
        expect.arrayContaining([
          { _id: 'd1', name: 'Default Cat', isDefault: true },
          {
            _id: 'u1',
            name: 'User Cat',
            userId: { name: 'User', email: 'user@test.com' },
          },
        ])
      );
    });
  });

  describe('getCategoryById', () => {
    it('should return category if found', async () => {
      (Category.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'cat1' }),
      });

      const result = await CategoryService.getCategoryById('cat1');
      expect(result).toEqual({ _id: 'cat1' });
    });
  });

  describe('getCategoryByIdAndUserId', () => {
    it('should return category if found by id and userId', async () => {
      (Category.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'cat1', userId: 'user1' }),
      });

      const result = await CategoryService.getCategoryByIdAndUserId(
        'cat1',
        'user1'
      );
      expect(result).toEqual({ _id: 'cat1', userId: 'user1' });
    });
  });

  describe('updateCategory', () => {
    it('should update category and populate userId', async () => {
      (Category.findByIdAndUpdate as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'cat1', name: 'Updated' }),
      });

      const result = await CategoryService.updateCategory('cat1', {
        name: 'Updated',
      });
      expect(result).toEqual({ _id: 'cat1', name: 'Updated' });
    });
  });

  describe('deleteCategory', () => {
    it('should return false if category not found', async () => {
      (Category.findById as jest.Mock).mockResolvedValue(null);

      const result = await CategoryService.deleteCategory('cat1');
      expect(result).toBe(false);
    });

    it('should throw error if category is default', async () => {
      (Category.findById as jest.Mock).mockResolvedValue({ isDefault: true });

      await expect(CategoryService.deleteCategory('cat1')).rejects.toThrow(
        'Default kategoriler silinemez'
      );
    });

    it('should delete transactions and category if exists and not default', async () => {
      (Category.findById as jest.Mock).mockResolvedValue({ isDefault: false });
      (Transaction.deleteMany as jest.Mock).mockResolvedValue({
        deletedCount: 2,
      });
      (Category.findByIdAndDelete as jest.Mock).mockResolvedValue({
        _id: 'cat1',
      });

      const result = await CategoryService.deleteCategory('cat1');

      expect(Transaction.deleteMany).toHaveBeenCalledWith({
        categoryId: 'cat1',
      });
      expect(Category.findByIdAndDelete).toHaveBeenCalledWith('cat1');
      expect(result).toBe(true);
    });
  });
});
