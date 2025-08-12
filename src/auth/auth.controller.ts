import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);
      res.status(201).json({ message: "User registered", userId: user._id });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await AuthService.validateUser(email, password);
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "secretkey",
        {
          expiresIn: "1d",
        }
      );

      res.json({ token });
    } catch (error) {
      next(error);
    }
  }

  static async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const user = await AuthService.getUserProfile(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

}
