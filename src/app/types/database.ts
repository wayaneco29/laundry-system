// ====================================================================
// DATABASE TYPES FOR LAUNDRY SYSTEM
// Generated types for Supabase integration
// ====================================================================

// Base types for common fields
export type UUID = string;
export type Timestamp = string;

// ====================================================================
// ENUM TYPES (matching your PostgreSQL ENUMs)
// ====================================================================

export type OrderStatus =
  | "Pending"
  | "Ongoing"
  | "Ready for Pickup"
  | "Picked up";
export type PaymentStatus = "Paid" | "Unpaid";
export type ServiceStatus = "Active" | "Inactive";
export type PromoStatus =
  | "Pending"
  | "Active"
  | "Expired"
  | "Closed"
  | "Deleted";
export type StockStatus =
  | "In Stock"
  | "Low Stock"
  | "Critical"
  | "Out of Stock";
export type ExpenseCategory =
  | "Supplies"
  | "Equipment"
  | "Utilities"
  | "Rent"
  | "Salaries"
  | "Marketing"
  | "Maintenance"
  | "Transportation"
  | "Insurance"
  | "Other";
export type ExpenseStatus = "Pending" | "Approved" | "Rejected" | "Paid";
export type PaymentMethod =
  | "Cash"
  | "Bank Transfer"
  | "Credit Card"
  | "Check"
  | "Other";
export type PaymentMode = "Cash" | "GCash";
export type RecurringFrequency = "Weekly" | "Monthly" | "Quarterly" | "Yearly";

// ====================================================================
// DATABASE TABLE TYPES
// ====================================================================

// BRANCHES Table
export interface Branch {
  id: UUID;
  name: string;
  description?: string;
  address: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

export interface BranchStock {
  id: UUID;
  name: string;
  quantity: number;
}

// BRANCH STOCKS Table
export interface BranchStocks {
  id: UUID;
  branch_id: UUID;
  name: string;
  quantity: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// STOCKS Table
export interface Stocks {
  id: UUID;
  name: string;
  category?: string;
  supplier?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// CUSTOMERS Table
export interface Customer {
  customer_id: UUID;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// STAFFS Table
export interface Staff {
  id: UUID;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  email?: string;
  address: string;
  employment_date: string; // DATE format: YYYY-MM-DD
  branch_id?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
}

// SERVICES Table
export interface Service {
  id: UUID;
  name: string;
  price: number;
  status: ServiceStatus;
  branch_id?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// ORDERS Table
export interface Order {
  order_id: string; // Format: ORD_0000001
  customer_id?: UUID;
  branch_id?: UUID;
  items: OrderItem[];
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  order_date: Timestamp;
  total_price: number;
  mode_of_payment?: PaymentMode;
  staff_shift_id?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

export interface OrderItem {
  id: UUID; // Service ID
  name: string; // Service name
  price: number; // Service price
  quantity: string; // Quantity as string (legacy format)
  total: number; // price * quantity
}

// PROMOS Table
export interface Promo {
  id: UUID;
  name: string;
  code: string;
  description?: string;
  valid_until: string; // DATE format: YYYY-MM-DD
  status: PromoStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// EXPENSES Table
export interface Expense {
  id: UUID;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string; // DATE format: YYYY-MM-DD
  receipt_url?: string;
  branch_id?: UUID;
  vendor_name?: string;
  vendor_contact?: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
  next_due_date?: string; // DATE format: YYYY-MM-DD
  status: ExpenseStatus;
  approved_by?: UUID;
  approved_at?: Timestamp;
  paid_at?: Timestamp;
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// STAFF SHIFTS Table
export interface StaffShift {
  id: UUID;
  primary_staff_id: UUID;
  partner_staff_id?: UUID;
  branch_id: UUID;
  shift_date: string; // DATE format: YYYY-MM-DD
  start_time: Timestamp;
  end_time?: Timestamp;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

// INVENTORY USAGE Table
export interface InventoryUsage {
  id: UUID;
  order_id: string;
  stock_id: UUID;
  branch_id: UUID;
  quantity_used: number;
  usage_date: Timestamp;
  created_at: Timestamp;
  created_by?: UUID;
}

// ====================================================================
// VIEW TYPES (Database Views)
// ====================================================================

// VIEW_CUSTOMERS
export interface CustomerView extends Customer {
  full_name: string; // Computed field
}

// VIEW_ORDERS
export interface OrderView extends Order {
  customer_name?: string; // From joined customer
  branch_name?: string; // From joined branch
}

// VIEW_SERVICES
export interface ServiceView extends Service {
  branch_name?: string; // From joined branch
}

// VIEW_STAFFS
export interface StaffView extends Staff {
  full_name: string; // Computed field
  branch_name?: string; // From joined branch
}

// VIEW_BRANCHES (same as Branch)
export type BranchView = Branch;

// VIEW_EXPENSES
export interface ExpenseView extends Expense {
  branch_name?: string; // From joined branch
  approval_status: string; // Computed field
}

// ====================================================================
// FUNCTION PARAMETER TYPES
// ====================================================================

// Upsert Customer Parameters
export interface UpsertCustomerParams {
  p_customer_id?: UUID;
  p_first_name: string;
  p_middle_name?: string;
  p_last_name: string;
  p_phone: string;
  p_email?: string;
  p_address?: string;
  p_created_by?: UUID;
}

// Upsert Branch Parameters
export interface UpsertBranchParams {
  p_branch_id?: UUID;
  p_name: string;
  p_description?: string;
  p_address: string;
  p_created_by?: UUID;
}

// Upsert Staff Parameters
export interface UpsertStaffParams {
  p_staff_id?: UUID;
  p_first_name: string;
  p_middle_name?: string;
  p_last_name: string;
  p_phone: string;
  p_email?: string;
  p_address: string;
  p_employment_date: string;
  p_branch_id?: UUID;
  p_created_by?: UUID;
}

// Upsert Service Parameters
export interface UpsertServiceParams {
  p_service_id?: UUID;
  p_name: string;
  p_price: number;
  p_status?: ServiceStatus;
  p_branch_id?: UUID;
  p_created_by?: UUID;
}

// Upsert Promo Parameters
export interface UpsertPromoParams {
  p_promo_id?: UUID;
  p_name: string;
  p_code: string;
  p_description?: string;
  p_valid_until: string;
  p_status?: PromoStatus;
  p_created_by?: UUID;
}

// Add Order Parameters
export interface AddOrderParams {
  p_customer_id: UUID;
  p_branch_id: UUID;
  p_items: OrderItem[];
  p_total_price: number;
  p_order_status?: OrderStatus;
  p_payment_status?: PaymentStatus;
  p_mode_of_payment?: PaymentMode;
  p_inventory_usage?: InventoryUsageItem[];
  p_created_by?: UUID;
}

// Staff Shift Parameters
export interface StartStaffShiftParams {
  p_primary_staff_id: UUID;
  p_branch_id: UUID;
  p_partner_staff_id?: UUID;
}

// Inventory Usage Item
export interface InventoryUsageItem {
  stock_id: UUID;
  quantity: number;
}

// ====================================================================
// FUNCTION RETURN TYPES
// ====================================================================

// Customer Summary Function
export interface CustomerSummary {
  customer_id: UUID;
  full_name: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  last_order_date?: Timestamp;
}

// Order Stats Function
export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  paid_orders: number;
  unpaid_orders: number;
  pending_orders: number;
  completed_orders: number;
}

// Low Stock Items Function
export interface LowStockItem {
  branch_id: UUID;
  branch_name: string;
  item_name: string;
  current_quantity: number;
  status: StockStatus;
}

// Service Popularity Function
export interface ServicePopularity {
  service_id: UUID;
  service_name: string;
  branch_name?: string;
  price: number;
  order_count: number;
  total_quantity: number;
  total_revenue: number;
}

// Dashboard Stats Function
export interface DashboardStats {
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  today_orders: number;
  today_revenue: number;
}

// Monthly Sales Chart Function
export interface MonthlySalesChart {
  month_name: string;
  month_number: number;
  total_orders: number;
  total_revenue: number;
}

// Monthly Customers Function
export interface MonthlyCustomers {
  month_name: string;
  month_number: number;
  new_customers: number;
  total_customers: number;
}

// Active Staff Shift Function
export interface ActiveStaffShift {
  shift_id: UUID;
  partner_staff_id?: UUID;
  partner_name?: string;
  branch_id: UUID;
  branch_name: string;
  start_time: Timestamp;
}

// Staff Sales Report Function
export interface StaffSalesReport {
  staff_name: string;
  partner_name: string;
  total_orders: number;
  total_sales: number;
  cash_sales: number;
  gcash_sales: number;
  commission_amount: number;
  inventory_usage: InventoryUsageReport[];
}

// Inventory Usage Report
export interface InventoryUsageReport {
  stock_name: string;
  quantity_used: number;
  usage_date: Timestamp;
}

// ====================================================================
// API RESPONSE TYPES
// ====================================================================

// Standard API Response Format
export interface ApiResponse<T> {
  data: T | null;
  error: any;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: any;
}

// ====================================================================
// FORM TYPES
// ====================================================================

// Customer Form
export interface CustomerFormData {
  customer_id?: UUID;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  email?: string;
  address?: string;
}

// Branch Form
export interface BranchFormData {
  branch_id?: UUID;
  name: string;
  description?: string;
  address: string;
}

// Staff Form
export interface StaffFormData {
  staff_id?: UUID;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  email?: string;
  address: string;
  employment_date: string;
  branch_id?: UUID;
}

// Service Form
export interface ServiceFormData {
  service_id?: UUID;
  name: string;
  price: number;
  status?: ServiceStatus;
  branch_id?: UUID;
}

// Promo Form
export interface PromoFormData {
  promo_id?: UUID;
  name: string;
  code: string;
  description?: string;
  valid_until: string;
  status?: PromoStatus;
}

// Order Form
export interface OrderFormData {
  customer_id: UUID;
  branch_id: UUID;
  items: OrderItem[];
  order_status?: OrderStatus;
  payment_status?: PaymentStatus;
  mode_of_payment?: PaymentMode;
  inventory_usage?: InventoryUsageItem[];
}

// Staff Shift Form
export interface StaffShiftFormData {
  primary_staff_id: UUID;
  partner_staff_id?: UUID;
  branch_id: UUID;
}

// ====================================================================
// UTILITY TYPES
// ====================================================================

// Search Parameters
export interface SearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Filter Parameters
export interface FilterParams {
  branch_id?: UUID;
  start_date?: string;
  end_date?: string;
  status?: string;
}

// Table Column Definition
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

// Modal State
export interface ModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  data?: any;
}

// Chart Data
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Export types for better imports
export type {
  // Table types
  Branch as BranchType,
  Customer as CustomerType,
  Staff as StaffType,
  Service as ServiceType,
  Order as OrderType,
  Promo as PromoType,
  Expense as ExpenseType,
  StaffShift as StaffShiftType,
  InventoryUsage as InventoryUsageType,

  // View types
  CustomerView as CustomerViewType,
  OrderView as OrderViewType,
  ServiceView as ServiceViewType,
  StaffView as StaffViewType,
  ExpenseView as ExpenseViewType,

  // Report types
  StaffSalesReport as StaffSalesReportType,
  ActiveStaffShift as ActiveStaffShiftType,
  InventoryUsageReport as InventoryUsageReportType,

  // Other common types
  OrderItem as OrderItemType,
  BranchStock as BranchStockType,
  DashboardStats as DashboardStatsType,
  InventoryUsageItem as InventoryUsageItemType,

  // Enum types
  ExpenseCategory as ExpenseCategoryType,
  ExpenseStatus as ExpenseStatusType,
  PaymentMethod as PaymentMethodType,
  PaymentMode as PaymentModeType,
  RecurringFrequency as RecurringFrequencyType,
};
