import React from "react";
import { ApplicationStatus } from "../../types";
import { getStatusColor } from "../../lib/utils";

export const ApplicationStatusBadge: React.FC<{ status: ApplicationStatus }> = ({
  status,
}) => {
  const config = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
};
