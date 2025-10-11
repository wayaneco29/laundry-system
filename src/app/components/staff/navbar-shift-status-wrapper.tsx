'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';

export function NavbarShiftStatusWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render after mount to prevent hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  // Dynamically import and render the actual component only after mount
  const NavbarShiftStatus = require('./navbar-shift-status').NavbarShiftStatus;
  return <NavbarShiftStatus />;
}