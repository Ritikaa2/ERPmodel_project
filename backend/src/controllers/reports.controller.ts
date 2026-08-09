import { Request, Response, NextFunction } from 'express';
import { inMemoryStore } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export class ReportsController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = inMemoryStore.customers;
      const products = inMemoryStore.products;
      const challans = inMemoryStore.challans;

      const totalCustomers = customers.length;
      const totalProducts = products.length;
      const lowStockCount = products.filter((p) => p.stock_quantity <= p.min_stock_level).length;
      
      const totalSalesRevenue = challans
        .filter((c) => c.status !== 'Cancelled')
        .reduce((sum, c) => sum + Number(c.total_amount), 0);

      const confirmedChallansCount = challans.filter((c) => c.status === 'Confirmed').length;
      const draftChallansCount = challans.filter((c) => c.status === 'Draft').length;

      // Top customers by spend
      const customerSpendMap: Record<string, number> = {};
      challans.forEach((c) => {
        if (c.status !== 'Cancelled') {
          customerSpendMap[c.customer_name] = (customerSpendMap[c.customer_name] || 0) + Number(c.total_amount);
        }
      });

      const topCustomers = Object.entries(customerSpendMap)
        .map(([name, spend]) => ({ name, spend }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5);

      return res.status(200).json(
        ApiResponse.success({
          totalCustomers,
          totalProducts,
          lowStockCount,
          totalSalesRevenue,
          confirmedChallansCount,
          draftChallansCount,
          topCustomers,
          salesData: [
            { day: '01 May', sales: 12000 },
            { day: '05 May', sales: 18500 },
            { day: '09 May', sales: 25200 },
            { day: '13 May', sales: 21000 },
            { day: '17 May', sales: 36500 },
            { day: '21 May', sales: 31200 },
            { day: '25 May', sales: 42100 },
            { day: '29 May', sales: 45500 },
          ],
        })
      );
    } catch (error) {
      next(error);
    }
  }
}
