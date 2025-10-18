"use client";

/**
 * Thermal Printer Utility for ESC/POS Bluetooth Printers
 * Compatible with GooJPRT and similar thermal printers
 */

// ESC/POS Commands
const ESC = 0x1b;
const GS = 0x1d;

export class ThermalPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private encoder = new TextEncoder();
  private deviceName: string | null = null;

  /**
   * Get connected device name
   */
  getDeviceName(): string | null {
    return this.deviceName;
  }

  /**
   * Connect to bluetooth thermal printer
   */
  async connect(): Promise<void> {
    try {
      // Request bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb", // Common printer service
          "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Another common service
        ],
      });

      if (!this.device.gatt) {
        throw new Error("GATT not available");
      }

      // Connect to GATT server
      const server = await this.device.gatt.connect();

      // Get primary service
      const services = await server.getPrimaryServices();
      if (services.length === 0) {
        throw new Error("No services found");
      }

      // Try to find write characteristic
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            this.characteristic = char;
            break;
          }
        }
        if (this.characteristic) break;
      }

      if (!this.characteristic) {
        throw new Error("No writable characteristic found");
      }

      // Store device name for future reference
      this.deviceName = this.device.name || "Unknown Printer";
    } catch (error) {
      console.error("Failed to connect to printer:", error);
      throw error;
    }
  }

  /**
   * Disconnect from printer
   */
  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    this.deviceName = null;
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  /**
   * Send data to printer
   */
  private async send(data: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error("Printer not connected");
    }

    // Split data into chunks (some printers have MTU limitations)
    const chunkSize = 512;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
      // Small delay between chunks
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /**
   * Initialize printer
   */
  private async init(): Promise<void> {
    await this.send(new Uint8Array([ESC, 0x40])); // Initialize
  }

  /**
   * Set text alignment
   */
  private async setAlign(align: "left" | "center" | "right"): Promise<void> {
    const alignCode = align === "left" ? 0 : align === "center" ? 1 : 2;
    await this.send(new Uint8Array([ESC, 0x61, alignCode]));
  }

  /**
   * Set text size
   */
  private async setTextSize(size: number): Promise<void> {
    const sizeCode = ((size - 1) << 4) | (size - 1);
    await this.send(new Uint8Array([GS, 0x21, sizeCode]));
  }

  /**
   * Set text bold
   */
  private async setBold(bold: boolean): Promise<void> {
    await this.send(new Uint8Array([ESC, 0x45, bold ? 1 : 0]));
  }

  /**
   * Print text
   */
  private async printText(text: string): Promise<void> {
    await this.send(this.encoder.encode(text));
  }

  /**
   * Print line
   */
  private async printLine(text: string = ""): Promise<void> {
    await this.printText(text + "\n");
  }

  /**
   * Print separator line
   */
  private async printSeparator(): Promise<void> {
    await this.printLine("--------------------------------");
  }

  /**
   * Feed paper
   */
  private async feed(lines: number = 1): Promise<void> {
    for (let i = 0; i < lines; i++) {
      await this.printLine();
    }
  }

  /**
   * Cut paper
   */
  private async cut(): Promise<void> {
    await this.send(new Uint8Array([GS, 0x56, 0x00])); // Full cut
  }

  /**
   * Print receipt
   */
  async printReceipt(receiptData: {
    order_id: string;
    order_date: string;
    branch_name: string;
    staff_name: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    total_price: number;
  }): Promise<void> {
    try {
      await this.init();

      // Header
      await this.setAlign("center");
      await this.setTextSize(2);
      await this.setBold(true);
      await this.printLine("Laundry Shop Inc.");

      await this.setTextSize(1);
      await this.setBold(false);
      await this.printLine("123 Main Street");
      await this.printLine("Anytown, USA");
      await this.printLine("Tel: (123) 456-7890");
      await this.feed(1);

      await this.printSeparator();

      // Order details
      await this.setAlign("left");
      await this.printLine(`Order #: ${receiptData.order_id}`);
      await this.printLine(`Date: ${receiptData.order_date}`);
      await this.printLine(`Branch: ${receiptData.branch_name}`);
      await this.printLine(`Cashier: ${receiptData.staff_name || "N/A"}`);

      await this.printSeparator();

      // Items header
      await this.setBold(true);
      await this.printLine("Item         Qty      Total");
      await this.setBold(false);

      // Items
      for (const item of receiptData.items) {
        const name = item.name.substring(0, 12).padEnd(12);
        const qty = `${item.quantity}kg`.padStart(8);
        const total = `P${item.total}`.padStart(8);
        await this.printLine(`${name} ${qty} ${total}`);
      }

      await this.printSeparator();

      // Totals
      await this.printLine(
        `Subtotal:              P${receiptData.total_price}`
      );
      await this.printLine(`Tax:                   P0.00`);

      await this.printSeparator();

      await this.setBold(true);
      await this.setTextSize(2);
      await this.printLine(`TOTAL:           P${receiptData.total_price}`);

      await this.setTextSize(1);
      await this.setBold(false);
      await this.printSeparator();

      // Footer
      await this.setAlign("center");
      await this.printLine("Thank you for your business!");
      await this.feed(3);

      // Cut paper
      await this.cut();
    } catch (error) {
      console.error("Failed to print receipt:", error);
      throw error;
    }
  }

  /**
   * Print test message to confirm connection
   */
  async printTestMessage(): Promise<void> {
    try {
      await this.init();

      // Center align
      await this.setAlign("center");

      // Print logo/header
      await this.setTextSize(2);
      await this.setBold(true);
      await this.printLine("Laundry Shop Inc.");

      await this.setTextSize(1);
      await this.setBold(false);
      await this.feed(1);

      await this.printSeparator();

      // Success message
      await this.setTextSize(2);
      await this.setBold(true);
      await this.printLine("PRINTER CONNECTED");

      await this.setTextSize(1);
      await this.setBold(false);
      await this.feed(1);

      await this.printSeparator();

      // Info
      await this.printLine("Connection successful!");
      await this.printLine(`Device: ${this.deviceName || "Unknown"}`);
      await this.printLine(`Time: ${new Date().toLocaleString()}`);

      await this.feed(1);
      await this.printSeparator();

      await this.printLine("Ready to print receipts");
      await this.feed(3);

      // Cut paper
      await this.cut();
    } catch (error) {
      console.error("Failed to print test message:", error);
      throw error;
    }
  }
}

// Singleton instance
let printerInstance: ThermalPrinter | null = null;

export const getThermalPrinter = (): ThermalPrinter => {
  if (!printerInstance) {
    printerInstance = new ThermalPrinter();
  }
  return printerInstance;
};
