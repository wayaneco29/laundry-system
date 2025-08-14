// ====================================================================
// TYPES INDEX - Export all type definitions
// ====================================================================

// Database types
export * from "./database";
export * from "./role";

// Re-export commonly used types with shorter names
export type {
  BranchType,
  CustomerType,
  StaffType,
  ServiceType,
  OrderType,
  PromoType,
  CustomerViewType,
  OrderViewType,
  ServiceViewType,
  StaffViewType,
  OrderItemType,
  BranchStockType,
  DashboardStatsType,
} from "./database";
