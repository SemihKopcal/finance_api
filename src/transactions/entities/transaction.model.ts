import { Schema, model, Document } from 'mongoose';

export interface ITransaction extends Document {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  categoryId: object;
  isDefault: boolean;
  userId?: object;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  isDefault: { type: Boolean, default: false, required: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Transaction = model<ITransaction>(
  'Transaction',
  transactionSchema
);
