"use client";

import { useEffect, useState } from "react";
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";
import { usePrinterContext } from "@/app/context/PrinterContext";
import { Button } from "../common";

export const PrinterStatusIndicator = () => {
  const {
    isConnected,
    isConnecting,
    lastConnectedDevice,
    connect,
    disconnect,
  } = usePrinterContext();
  const [showDetails, setShowDetails] = useState(false);

  const handleReconnect = async () => {
    if (isConnected) {
      await disconnect();
    }
    await connect();

    setShowDetails(false);
  };

  return (
    <>
      {/* Status Badge - Always visible */}
      <div
        className="relative cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 min-h-[44px] ${
            isConnected
              ? "bg-green-50 border border-green-200 hover:bg-green-100"
              : isConnecting
              ? "bg-blue-50 border border-blue-200"
              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          {isConnecting ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : isConnected ? (
            <BluetoothConnected className="w-4 h-4 text-green-600" />
          ) : (
            <BluetoothOff className="w-4 h-4 text-gray-500" />
          )}
          <span
            className={`text-xs font-medium ${
              isConnected
                ? "text-green-700"
                : isConnecting
                ? "text-blue-700"
                : "text-gray-600"
            }`}
          >
            {isConnecting
              ? "Connecting..."
              : isConnected
              ? "Printer"
              : "No Printer"}
          </span>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div
          className="fixed h-screen inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isConnected
                      ? "bg-green-100"
                      : isConnecting
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  {isConnecting ? (
                    <Loader2
                      className={`w-5 h-5 animate-spin ${
                        isConnected
                          ? "text-green-600"
                          : isConnecting
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    />
                  ) : isConnected ? (
                    <BluetoothConnected className="w-5 h-5 text-green-600" />
                  ) : (
                    <Bluetooth className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Printer Status
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isConnecting
                      ? "Connecting to printer..."
                      : isConnected
                      ? "Connected"
                      : "Not connected"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {lastConnectedDevice && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Device Name
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {lastConnectedDevice}
                  </p>
                </div>
              )}

              {isConnected && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">
                    Ready to print
                  </span>
                </div>
              )}

              {!isConnected && !isConnecting && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <BluetoothOff className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    Printer not connected
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {isConnected ? (
                  <>
                    <Button
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                      onClick={handleReconnect}
                      disabled={isConnecting}
                    >
                      Reconnect
                    </Button>
                    <Button
                      leftIcon={<BluetoothOff className="w-4 h-4" />}
                      className="w-full min-h-[48px] bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center gap-2"
                      onClick={disconnect}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    leftIcon={
                      isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bluetooth className="w-4 h-4" />
                      )
                    }
                    className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                    onClick={async () => {
                      connect();
                      setShowDetails(false);
                    }}
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect Printer"}
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Thermal receipts will print automatically after creating
                  orders
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
