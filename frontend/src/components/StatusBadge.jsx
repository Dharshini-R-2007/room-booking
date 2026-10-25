import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let variant = 'info';
  let IconComponent = Info;

  if (['ACTIVE', 'CONFIRMED', 'AVAILABLE'].includes(normalized)) {
    variant = 'active';
    IconComponent = CheckCircle2;
  } else if (['INACTIVE', 'CANCELLED', 'BOOKED'].includes(normalized)) {
    variant = 'inactive';
    IconComponent = XCircle;
  } else if (['MAINTENANCE', 'PENDING'].includes(normalized)) {
    variant = 'maintenance';
    IconComponent = AlertTriangle;
  }

  return (
    <span className={`status-badge ${variant}`}>
      <IconComponent size={12} strokeWidth={2} />
      <span>{normalized}</span>
    </span>
  );
};

export default StatusBadge;
