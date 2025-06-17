"use server";

import { createClient } from "@/app/utils/supabase/server";

export type InventoryStockLevels = {
  total_items: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  critical_stock: number;
};

export type InventoryByCategory = {
  category: string;
  count: number;
  total_quantity: number;
};

export type InventoryMovement = {
  date: string;
  movements_in: number;
  movements_out: number;
  net_change: number;
};

export type LowStockAlert = {
  id: string;
  name: string;
  branch_name: string;
  current_stock: number;
  status: 'Low Stock' | 'Out of Stock' | 'Critical';
  last_updated: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  branch_name: string;
  quantity: number;
  status: string;
  last_updated: string;
};

export const getInventoryStockLevels = async (branchId?: string) => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("view_branches")
      .select("branch_stocks");

    if (branchId && branchId !== "") {
      query = query.eq("id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    let totalItems = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let criticalStock = 0;

    data?.forEach((branch) => {
      if (branch.branch_stocks) {
        const stocks = Array.isArray(branch.branch_stocks) 
          ? branch.branch_stocks 
          : JSON.parse(branch.branch_stocks || '[]');
        
        stocks.forEach((item: any) => {
          totalItems++;
          const quantity = parseInt(item.quantity) || 0;
          
          if (quantity === 0) {
            outOfStock++;
          } else if (quantity <= 5) {
            criticalStock++;
          } else if (quantity <= 10) {
            lowStock++;
          } else {
            inStock++;
          }
        });
      }
    });

    const stockLevels: InventoryStockLevels = {
      total_items: totalItems,
      in_stock: inStock,
      low_stock: lowStock,
      out_of_stock: outOfStock,
      critical_stock: criticalStock
    };

    return {
      data: stockLevels,
      error: null,
    };
  } catch (error) {
    console.error("getInventoryStockLevels", error);
    return {
      data: null,
      error,
    };
  }
};

export const getInventoryByCategory = async (branchId?: string) => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("view_branches")
      .select("branch_stocks");

    if (branchId && branchId !== "") {
      query = query.eq("id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const categoryMap: Record<string, { count: number; total_quantity: number }> = {};

    data?.forEach((branch) => {
      if (branch.branch_stocks) {
        const stocks = Array.isArray(branch.branch_stocks) 
          ? branch.branch_stocks 
          : JSON.parse(branch.branch_stocks || '[]');
        
        stocks.forEach((item: any) => {
          // Categorize items based on common laundry supply types
          const category = categorizeInventoryItem(item.name);
          const quantity = parseInt(item.quantity) || 0;
          
          if (!categoryMap[category]) {
            categoryMap[category] = { count: 0, total_quantity: 0 };
          }
          
          categoryMap[category].count++;
          categoryMap[category].total_quantity += quantity;
        });
      }
    });

    const categories: InventoryByCategory[] = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      total_quantity: data.total_quantity
    }));

    return {
      data: categories,
      error: null,
    };
  } catch (error) {
    console.error("getInventoryByCategory", error);
    return {
      data: [],
      error,
    };
  }
};

export const getLowStockAlerts = async (branchId?: string) => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("view_branches")
      .select("id, name, branch_stocks, updated_at");

    if (branchId && branchId !== "") {
      query = query.eq("id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const alerts: LowStockAlert[] = [];

    data?.forEach((branch) => {
      if (branch.branch_stocks) {
        const stocks = Array.isArray(branch.branch_stocks) 
          ? branch.branch_stocks 
          : JSON.parse(branch.branch_stocks || '[]');
        
        stocks.forEach((item: any) => {
          const quantity = parseInt(item.quantity) || 0;
          
          if (quantity <= 10) { // Low stock threshold
            let status: 'Low Stock' | 'Out of Stock' | 'Critical';
            
            if (quantity === 0) {
              status = 'Out of Stock';
            } else if (quantity <= 5) {
              status = 'Critical';
            } else {
              status = 'Low Stock';
            }

            alerts.push({
              id: item.id || `${branch.id}_${item.name}`,
              name: item.name,
              branch_name: branch.name,
              current_stock: quantity,
              status,
              last_updated: branch.updated_at
            });
          }
        });
      }
    });

    // Sort by urgency (Out of Stock first, then Critical, then Low Stock)
    alerts.sort((a, b) => {
      const urgencyOrder = { 'Out of Stock': 0, 'Critical': 1, 'Low Stock': 2 };
      return urgencyOrder[a.status] - urgencyOrder[b.status];
    });

    return {
      data: alerts,
      error: null,
    };
  } catch (error) {
    console.error("getLowStockAlerts", error);
    return {
      data: [],
      error,
    };
  }
};

export const getInventoryItems = async (branchId?: string, limit: number = 20) => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("view_branches")
      .select("id, name, branch_stocks, updated_at");

    if (branchId && branchId !== "") {
      query = query.eq("id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const items: InventoryItem[] = [];

    data?.forEach((branch) => {
      if (branch.branch_stocks) {
        const stocks = Array.isArray(branch.branch_stocks) 
          ? branch.branch_stocks 
          : JSON.parse(branch.branch_stocks || '[]');
        
        stocks.forEach((item: any) => {
          const quantity = parseInt(item.quantity) || 0;
          let status: string;
          
          if (quantity === 0) {
            status = 'Out of Stock';
          } else if (quantity <= 5) {
            status = 'Critical';
          } else if (quantity <= 10) {
            status = 'Low Stock';
          } else {
            status = 'In Stock';
          }

          items.push({
            id: item.id || `${branch.id}_${item.name}`,
            name: item.name,
            category: categorizeInventoryItem(item.name),
            branch_name: branch.name,
            quantity,
            status,
            last_updated: branch.updated_at
          });
        });
      }
    });

    // Sort by urgency and then alphabetically
    items.sort((a, b) => {
      const statusOrder = { 'Out of Stock': 0, 'Critical': 1, 'Low Stock': 2, 'In Stock': 3 };
      const statusComparison = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      
      if (statusComparison !== 0) return statusComparison;
      return a.name.localeCompare(b.name);
    });

    return {
      data: items.slice(0, limit),
      error: null,
    };
  } catch (error) {
    console.error("getInventoryItems", error);
    return {
      data: [],
      error,
    };
  }
};

// Helper function to categorize inventory items
function categorizeInventoryItem(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('detergent') || lowerName.includes('soap')) {
    return 'Detergents';
  } else if (lowerName.includes('softener') || lowerName.includes('fabric')) {
    return 'Fabric Softeners';
  } else if (lowerName.includes('bleach') || lowerName.includes('whitener')) {
    return 'Bleach & Whiteners';
  } else if (lowerName.includes('stain') || lowerName.includes('remover')) {
    return 'Stain Removers';
  } else if (lowerName.includes('fragrance') || lowerName.includes('scent')) {
    return 'Fragrances';
  } else if (lowerName.includes('bag') || lowerName.includes('hanger') || lowerName.includes('plastic')) {
    return 'Packaging';
  } else {
    return 'Others';
  }
}