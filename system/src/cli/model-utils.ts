
  // Add audit columns if they don't exist
  export const auditColumns = {
    created_at: { type: "datetime", default: "now()" },
    created_by: "uuid",
    updated_at: { type: "datetime", default: "now()" },
    updated_by: "uuid",
    deleted_at: "datetime",
  };