import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    type: "income" | "expense";
    color: string; // it will be hex color
    userId:object;
    isDefault:boolean;
    createdAt:Date;
}

const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    color: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export const Category = model<ICategory>("Category", categorySchema);
