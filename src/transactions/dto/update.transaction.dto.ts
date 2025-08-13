/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateTransactionDto:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           example: 200.50
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           example: "income"
 *         categoryId:
 *           type: string
 *           example: "64e5b2f2c2a4f2a1b8e5b2f2"
 *         description:
 *           type: string
 *           example: "Fatura ödemesi"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-08-13T12:00:00.000Z"
 */
export interface UpdateTransactionDto {
  amount?: number;
  type?: "income" | "expense";
  categoryId?: string;
  description?: string;
  date?: string;
}