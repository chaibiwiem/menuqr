import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { cn } from '../../lib/utils';

export default function NotificationBell({ unreadCount = 0, onOpen }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function toggle() {
    setOpen((v) => !v);
    if (!open && onOpen) onOpen();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors w-full',
          open
            ? 'bg-orange-50 text-orange-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        )}
      >
        <Bell size={18} className="shrink-0" />
        <span className="truncate flex-1 text-left">Notifications</span>
        {unreadCount > 0 && (
          <span className="shrink-0 px-1.5 min-w-[18px] text-center py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-tight animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full top-0 ml-2 z-50">
          <NotificationCenter onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
