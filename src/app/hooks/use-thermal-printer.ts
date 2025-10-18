import { useState, useCallback, useEffect } from "react";
import { getThermalPrinter } from "@/app/utils/thermal-printer";
import { useToast } from "./use-toast";

export const useThermalPrinter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const toast = useToast();
  const printer = getThermalPrinter();

  // Check connection status on mount
  useEffect(() => {
    setIsConnected(printer.isConnected());
  }, [printer]);

  /**
   * Connect to bluetooth thermal printer
   */
  const connect = useCallback(async () => {
    if (isConnected) {
      toast.info("Printer already connected");
      return true;
    }

    setIsConnecting(true);
    try {
      await printer.connect();
      setIsConnected(true);
      toast.success("Printer connected successfully");
      return true;
    } catch (error) {
      console.error("Failed to connect to printer:", error);
      if (error instanceof Error) {
        if (error.message.includes("User cancelled")) {
          toast.info("Printer connection cancelled");
        } else {
          toast.error(`Failed to connect: ${error.message}`);
        }
      } else {
        toast.error("Failed to connect to printer");
      }
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, printer, toast]);

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

  return {
    isConnected,
    isConnecting,
    isPrinting,
    connect,
    disconnect,
    printReceipt,
  };
};
