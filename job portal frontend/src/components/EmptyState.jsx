import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message,
  action,
}) {
  return (
    <div className="bg-[#10205F]/50 rounded-2xl p-12 text-center border border-white/5 flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-[#08153D] border border-[#FAF92A]/15 flex items-center justify-center">
        <Icon size={24} className="text-[#FAF92A]" />
      </div>
      <p className="text-base font-semibold text-white">{title}</p>
      {message && <p className="text-xs text-[#AEB8D0] max-w-xs">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
