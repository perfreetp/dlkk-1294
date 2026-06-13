import { STATUS_LABELS, STATUS_COLORS } from '../../shared/types';
import type { CandidateStatus } from '../../shared/types';

interface StatusBadgeProps {
  status: CandidateStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const label = STATUS_LABELS[status];
  const colorClass = STATUS_COLORS[status];
  
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${colorClass}`}>
      {label}
    </span>
  );
}
