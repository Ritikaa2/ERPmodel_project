import { Request, Response, NextFunction } from 'express';
import { inMemoryStore } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export class ActivityLogController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = (inMemoryStore as any).activity_logs || [];
      return res.status(200).json(ApiResponse.success(logs));
    } catch (error) {
      next(error);
    }
  }

  static async logAction(action: string, details: string, userName: string, userEmail: string) {
    const logs = (inMemoryStore as any).activity_logs || [];
    logs.unshift({
      id: logs.length + 1,
      action,
      details,
      user_name: userName,
      user_email: userEmail,
      created_at: new Date().toISOString(),
    });
    (inMemoryStore as any).activity_logs = logs;
  }
}
