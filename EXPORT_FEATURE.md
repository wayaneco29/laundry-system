# Export Report Feature

## Overview

The Export Report feature has been successfully implemented in the laundry system reports page. This feature allows users to export report data in both PDF and Excel formats with the ability to selectively choose which reports to include.

## Features

### Selective Report Export

- **Choose Specific Reports**: Users can select which reports they want to export
- **Select All/None**: Quick buttons to select all available reports or clear all selections
- **Report Count Display**: Shows the number of items in each report type
- **Smart Defaults**: Automatically selects all available reports when the modal opens

### Export Formats

- **PDF Export**: Single PDF file containing selected reports with formatted tables and summaries
- **Excel Export**: Single Excel file with multiple sheets (tabs) for each selected report type

### Available Report Types

- **Orders Report**: Order details including customer name, status, payment status, total price, and dates
- **Customers Report**: Customer information including full name, phone, email, address, and join date
- **Expenses Report**: Expense details including title, category, amount, status, and dates
- **Sales Summary**: Monthly sales data and analytics

### Date Range Filtering

- Export functionality respects the selected date range from the reports page
- Data is filtered based on the start and end dates before export
- Only shows reports that have data within the selected date range

## Implementation Details

### Files Created/Modified

1. **`src/app/utils/export-utils.ts`** (New)

   - Contains all export utility functions
   - Handles Excel and PDF generation
   - Includes data formatting functions for different formats

2. **`src/app/(main)/reports/components/export-modal.tsx`** (New)

   - Enhanced export modal with report selection checkboxes
   - Shows available data types with item counts
   - Provides Select All/None functionality
   - Displays export options and feedback

3. **`src/app/(main)/reports/components/main.tsx`** (Modified)
   - Integrated export functionality
   - Added export button with loading states
   - Fetches and prepares data for export

### Dependencies Added

- `jspdf`: For PDF generation
- `jspdf-autotable`: For creating tables in PDF exports
- `xlsx`: For Excel file generation with multiple sheets

## Usage

1. Navigate to the Reports page
2. Select desired date range using the date filter
3. Choose the relevant tab (Overview, Sales, Customers, etc.)
4. Click the "Export Report" button
5. **Select which reports to export** using the checkboxes
6. Choose export format (PDF or Excel)
7. Click "Export Report" to download the files

### Report Selection Interface

- **Checkboxes**: Individual selection for each report type
- **Item Counts**: Shows how many items are in each report
- **Select All**: Quickly select all available reports
- **Select None**: Clear all selections
- **Dynamic Button**: Shows count of selected reports in export button

## Technical Features

### PDF Export

- Professional formatting with company branding
- Summary sections with key metrics
- Formatted tables for each selected report type
- Date range information included
- Only includes selected reports

### Excel Export

- **Single Excel File**: All selected reports in one file
- **Multiple Sheets**: Each report type gets its own sheet (tab)
- **Summary Sheet**: Overview with sales data and report contents
- **Clean Formatting**: Proper column headers and data organization
- **Compatible**: Works with Excel, Google Sheets, and other spreadsheet applications
- **Professional**: Includes report metadata and generation date

### Excel Sheet Structure

1. **Summary Sheet** (if sales data available)

   - Report period and generation date
   - Sales summary with totals
   - List of included reports with item counts

2. **Orders Sheet**

   - Order ID, Customer Name, Branch
   - Status, Payment Status, Total Price
   - Order Date, Created Date

3. **Customers Sheet**

   - Full Name, Phone, Email, Address
   - Joined Date

4. **Expenses Sheet**
   - Title, Description, Category, Amount
   - Status, Payment Method, Vendor
   - Date, Created Date

### Error Handling

- Graceful error handling for failed exports
- User feedback for export status
- Loading states during data preparation
- Validation to ensure at least one report is selected

### User Experience

- Intuitive checkbox interface
- Visual feedback for selections
- Clear indication of available data
- Responsive design for different screen sizes
- Professional file output

## Future Enhancements

- Email export functionality
- Custom report templates
- Scheduled report generation
- Additional export formats (JSON, XML)
- Report customization options
- Save export preferences
- Bulk export scheduling
- Excel formatting options (colors, fonts, etc.)
