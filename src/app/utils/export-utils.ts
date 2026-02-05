import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ====================================================================
// EXPORT UTILITIES FOR LAUNDRY SYSTEM REPORTS
// ====================================================================

export interface ExportData {
  orders?: any[];
  customers?: any[];
  expenses?: any[];
  sales?: any;
  services?: any[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// ====================================================================
// EXCEL EXPORT FUNCTIONS
// ====================================================================

export const exportToExcel = (data: ExportData, filename: string) => {
  const workbook = XLSX.utils.book_new();

  // Add summary sheet if sales data exists
  if (data.sales) {
    const summaryData = [
      ["Laundry System Report Summary"],
      [""],
      [
        "Report Period",
        data.dateRange
          ? `${data.dateRange.startDate.toLocaleDateString()} - ${data.dateRange.endDate.toLocaleDateString()}`
          : "All Time",
      ],
      ["Generated On", new Date().toLocaleDateString()],
      [""],
      ["Sales Summary"],
      ["Total Sales", `₱${data.sales.totalSales?.toLocaleString() || "0"}`],
      ["Paid Sales", `₱${data.sales.paidSales?.toLocaleString() || "0"}`],
      ["Unpaid Sales", `₱${data.sales.unpaidSales?.toLocaleString() || "0"}`],
      [""],
      ["Report Contents"],
      [
        "Orders Report",
        data.orders ? `${data.orders.length} orders` : "No data",
      ],
      [
        "Customers Report",
        data.customers ? `${data.customers.length} customers` : "No data",
      ],
      [
        "Expenses Report",
        data.expenses ? `${data.expenses.length} expenses` : "No data",
      ],
      [
        "Services Report",
        data.services ? `${data.services.length} services` : "No data",
      ],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  }

  // Add orders sheet
  if (data.orders && data.orders.length > 0) {
    const ordersData = formatOrdersForExcel(data.orders);
    const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");
  }

  // Add customers sheet
  if (data.customers && data.customers.length > 0) {
    const customersData = formatCustomersForExcel(data.customers);
    const customersSheet = XLSX.utils.json_to_sheet(customersData);
    XLSX.utils.book_append_sheet(workbook, customersSheet, "Customers");
  }

  // Add expenses sheet
  if (data.expenses && data.expenses.length > 0) {
    const expensesData = formatExpensesForExcel(data.expenses);
    const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesSheet, "Expenses");
  }

  // Add services sheet
  if (data.services && data.services.length > 0) {
    const servicesData = formatServicesForExcel(data.services);
    const servicesSheet = XLSX.utils.json_to_sheet(servicesData);
    XLSX.utils.book_append_sheet(workbook, servicesSheet, "Services");
  }

  // Save the Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// ====================================================================
// CSV EXPORT FUNCTIONS (Legacy - now creates Excel file)
// ====================================================================

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values that need quotes (containing commas, quotes, or newlines)
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"') || value.includes("\n"))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ====================================================================
// PDF EXPORT FUNCTIONS
// ====================================================================

export const exportToPDF = (data: ExportData, filename: string) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Add title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Laundry System Report", 20, yPosition);
  yPosition += 10;

  // Add date range if available
  if (data.dateRange) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const startDate = data.dateRange.startDate.toLocaleDateString();
    const endDate = data.dateRange.endDate.toLocaleDateString();
    doc.text(`Period: ${startDate} - ${endDate}`, 20, yPosition);
    yPosition += 15;
  }

  // Add summary section
  if (data.sales) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Summary", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Total Sales: ₱${data.sales.totalSales?.toLocaleString() || "0"}`,
      20,
      yPosition
    );
    yPosition += 5;
    doc.text(
      `Paid Sales: ₱${data.sales.paidSales?.toLocaleString() || "0"}`,
      20,
      yPosition
    );
    yPosition += 5;
    doc.text(
      `Unpaid Sales: ₱${data.sales.unpaidSales?.toLocaleString() || "0"}`,
      20,
      yPosition
    );
    yPosition += 15;
  }

  // Add orders table
  if (data.orders && data.orders.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Orders Report", 20, yPosition);
    yPosition += 10;

    const ordersData = data.orders.map((order) => [
      order.order_id || "",
      order.customer_name || "",
      order.order_status || "",
      order.payment_status || "",
      `₱${order.total_price?.toLocaleString() || "0"}`,
      new Date(order.order_date).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Order ID", "Customer", "Status", "Payment", "Total", "Date"]],
      body: ordersData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Add customers table
  if (data.customers && data.customers.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Customers Report", 20, yPosition);
    yPosition += 10;

    const customersData = data.customers.map((customer) => [
      customer.full_name || `${customer.first_name} ${customer.last_name}`,
      customer.phone || "",
      customer.email || "",
      customer.address || "",
      new Date(customer.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Name", "Phone", "Email", "Address", "Joined Date"]],
      body: customersData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Add expenses table
  if (data.expenses && data.expenses.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Expenses Report", 20, yPosition);
    yPosition += 10;

    const expensesData = data.expenses.map((expense) => [
      expense.title || "",
      expense.category || "",
      `₱${expense.amount?.toLocaleString() || "0"}`,
      expense.status || "",
      new Date(expense.expense_date).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Title", "Category", "Amount", "Status", "Date"]],
      body: expensesData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Add services table
  if (data.services && data.services.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Services Report", 20, yPosition);
    yPosition += 10;

    const servicesData = data.services.map((service) => [
      service.service_name || "",
      service.category_name || "",
      service.total_orders || 0,
      service.total_quantity || 0,
      `₱${service.total_revenue?.toLocaleString() || "0"}`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Service Name", "Category", "Total Orders", "Total Quantity", "Revenue"]],
      body: servicesData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });
  }

  // Save the PDF
  doc.save(`${filename}.pdf`);
};

// ====================================================================
// DATA FORMATTING FUNCTIONS FOR EXCEL
// ====================================================================

export const formatOrdersForExcel = (orders: any[]) => {
  return orders.map((order) => ({
    "Order ID": order.order_id,
    "Customer Name": order.customer_name || "N/A",
    Branch: order.branch_name || "N/A",
    Status: order.order_status,
    "Payment Status": order.payment_status,
    "Total Price": order.total_price || 0,
    "Order Date": new Date(order.order_date).toLocaleDateString(),
    "Created At": new Date(order.created_at).toLocaleDateString(),
  }));
};

export const formatCustomersForExcel = (customers: any[]) => {
  return customers.map((customer) => ({
    "Full Name":
      customer.full_name || `${customer.first_name} ${customer.last_name}`,
    Phone: customer.phone,
    Email: customer.email || "N/A",
    Address: customer.address || "N/A",
    "Joined Date": new Date(customer.created_at).toLocaleDateString(),
  }));
};

export const formatExpensesForExcel = (expenses: any[]) => {
  return expenses.map((expense) => ({
    Title: expense.title,
    Description: expense.description || "N/A",
    Category: expense.category,
    Amount: expense.amount || 0,
    Status: expense.status,
    "Payment Method": expense.payment_method,
    Vendor: expense.vendor_name || "N/A",
    Date: new Date(expense.expense_date).toLocaleDateString(),
    "Created At": new Date(expense.created_at).toLocaleDateString(),
  }));
};

export const formatServicesForExcel = (services: any[]) => {
  return services.map((service) => ({
    "Service Name": service.service_name || "N/A",
    Category: service.category_name || "N/A",
    "Total Orders": service.total_orders || 0,
    "Total Quantity": service.total_quantity || 0,
    Revenue: service.total_revenue || 0,
  }));
};

// ====================================================================
// DATA FORMATTING FUNCTIONS FOR CSV (Legacy)
// ====================================================================

export const formatOrdersForExport = (orders: any[]) => {
  return orders.map((order) => ({
    "Order ID": order.order_id,
    "Customer Name": order.customer_name || "N/A",
    Branch: order.branch_name || "N/A",
    Status: order.order_status,
    "Payment Status": order.payment_status,
    "Total Price": `₱${order.total_price?.toLocaleString() || "0"}`,
    "Order Date": new Date(order.order_date).toLocaleDateString(),
    "Created At": new Date(order.created_at).toLocaleDateString(),
  }));
};

export const formatCustomersForExport = (customers: any[]) => {
  return customers.map((customer) => ({
    "Full Name":
      customer.full_name || `${customer.first_name} ${customer.last_name}`,
    Phone: customer.phone,
    Email: customer.email || "N/A",
    Address: customer.address || "N/A",
    "Joined Date": new Date(customer.created_at).toLocaleDateString(),
  }));
};

export const formatExpensesForExport = (expenses: any[]) => {
  return expenses.map((expense) => ({
    Title: expense.title,
    Description: expense.description || "N/A",
    Category: expense.category,
    Amount: `₱${expense.amount?.toLocaleString() || "0"}`,
    Status: expense.status,
    "Payment Method": expense.payment_method,
    Vendor: expense.vendor_name || "N/A",
    Date: new Date(expense.expense_date).toLocaleDateString(),
    "Created At": new Date(expense.created_at).toLocaleDateString(),
  }));
};

// ====================================================================
// MAIN EXPORT FUNCTION
// ====================================================================

export const exportReport = async (
  type: "csv" | "pdf" | "excel",
  data: ExportData,
  filename: string
) => {
  try {
    if (type === "csv" || type === "excel") {
      // Both CSV and Excel now create a single Excel file with multiple sheets
      exportToExcel(data, filename);
    } else if (type === "pdf") {
      exportToPDF(data, filename);
    }
  } catch (error) {
    console.error("Export failed:", error);
    alert("Export failed. Please try again.");
  }
};
