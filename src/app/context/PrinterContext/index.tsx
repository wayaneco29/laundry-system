"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { getThermalPrinter } from "@/app/utils/thermal-printer";
import { useToast } from "@/app/hooks";

interface PrinterContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isPrinting: boolean;
  lastConnectedDevice: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  printReceipt: (receiptData: {
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
  }) => Promise<boolean>;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export const usePrinterContext = () => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error("usePrinterContext must be used within PrinterProvider");
  }
  return context;
};

interface PrinterProviderProps {
  children: ReactNode;
}

export const PrinterProvider = ({ children }: PrinterProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [lastConnectedDevice, setLastConnectedDevice] = useState<string | null>(
    null
  );
  const toast = useToast();
  const printer = getThermalPrinter();

  // Load last connected device from localStorage
  useEffect(() => {
    const savedDevice = localStorage.getItem("thermal_printer_device");
    if (savedDevice) {
      setLastConnectedDevice(savedDevice);
    }
  }, []);

  // Auto-connect on mount if we have a previously connected device
  useEffect(() => {
    const autoConnect = async () => {
      if (lastConnectedDevice && !isConnected && !isConnecting) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          connect(true); // Silent auto-connect
        }, 1000);
      }
    };

    autoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastConnectedDevice]);

  /**
   * Connect to bluetooth thermal printer
   */
  const connect = useCallback(
    async (silent = false) => {
      if (isConnected) {
        if (!silent) {
          toast.info("Printer already connected");
        }
        return true;
      }

      setIsConnecting(true);
      try {
        await printer.connect();
        setIsConnected(true);

        // Save device info to localStorage for auto-reconnect
        const deviceName = printer.getDeviceName();
        if (deviceName) {
          localStorage.setItem("thermal_printer_device", deviceName);
          setLastConnectedDevice(deviceName);
        }

        // Print test message to confirm connection
        try {
          await printer.printTestMessage();
        } catch (printError) {
          console.error("Failed to print test message:", printError);
          // Don't fail the connection if test print fails
        }

        if (!silent) {
          toast.success("Printer connected successfully");
        }
        return true;
      } catch (error) {
        console.error("Failed to connect to printer:", error);
        if (!silent) {
          if (error instanceof Error) {
            if (error.message.includes("User cancelled")) {
              toast.info("Printer connection cancelled");
            } else {
              toast.error(`Failed to connect: ${error.message}`);
            }
          } else {
            toast.error("Failed to connect to printer");
          }
        }
        setIsConnected(false);
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [isConnected, printer, toast]
  );

  /**
   * Disconnect from printer
   */
  const disconnect = useCallback(async () => {
    try {
      await printer.disconnect();
      setIsConnected(false);
      toast.success("Printer disconnected");
    } catch (error) {
      console.error("Failed to disconnect from printer:", error);
      toast.error("Failed to disconnect from printer");
    }
  }, [printer, toast]);

  /**
   * Print receipt
   */
  const printReceipt = useCallback(
    async (receiptData: {
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
    }) => {
      setIsPrinting(true);
      try {
        // Connect if not already connected
        if (!printer.isConnected()) {
          const connected = await connect();
          if (!connected) {
            throw new Error("Failed to connect to printer");
          }
        }

        // Print the receipt
        await printer.printReceipt(receiptData);
        toast.success("Receipt printed successfully");
        return true;
      } catch (error) {
        console.error("Failed to print receipt:", error);
        if (error instanceof Error) {
          toast.error(`Print failed: ${error.message}`);
        } else {
          toast.error("Failed to print receipt");
        }
        return false;
      } finally {
        setIsPrinting(false);
      }
    },
    [printer, connect, toast]
  );

  const value: PrinterContextType = {
    isConnected,
    isConnecting,
    isPrinting,
    lastConnectedDevice,
    connect,
    disconnect,
    printReceipt,
  };

  return (
    <PrinterContext.Provider value={value}>{children}</PrinterContext.Provider>
  );
};
