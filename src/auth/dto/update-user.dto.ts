/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "johndoe@example.com"
 *         password:
 *           type: string
 *           example: "newpassword123"
 */
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}
