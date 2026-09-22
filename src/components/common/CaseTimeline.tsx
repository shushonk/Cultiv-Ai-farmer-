import React from 'react';
import { CaseTimelineItem, UserRole } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Bot, User as UserIcon, UserCheck, Shield, Clock } from 'lucide-react';

interface Props {
  timeline: CaseTimelineItem[];
}

export const CaseTimeline: React.FC<Props> = ({ timeline }) => {
  const getActorIcon = (role: UserRole | 'AI Engine') => {
    switch (role) {
      case 'AI Engine':
        return <Bot className="w-4 h-4 text-cyan-400" />;
      case 'FARMER':
        return <UserIcon className="w-4 h-4 text-emerald-400" />;
      case 'EXPERT':
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      case 'OFFICER':
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((item, idx) => {
          const isLast = idx === timeline.length - 1;
          const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <li key={item.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center ring-4 ring-[#0b1324]">
                      {getActorIcon(item.actorRole)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{item.action}</span>
                        {item.statusBadge && <StatusBadge status={item.statusBadge} />}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {dateStr}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mb-1 leading-relaxed">
                      {item.description}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      By <span className="text-slate-400">{item.actor}</span> ({item.actorRole})
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
