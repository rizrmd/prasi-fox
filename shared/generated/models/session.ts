import type { ModelBase } from "system/model/base";

export const session = {
  "table": "t_session",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "created_at": {
      "type": "datetime"
    },
    "status": {
      "type": "text",
      "default": "active"
    },
    "expired_at": {
      "type": "datetime"
    },
    "device_uuid": {
      "type": "uuid"
    },
    "created_date": {
      "type": "datetime",
      "default": "now()"
    },
    "created_by": {
      "type": "uuid"
    },
    "updated_date": {
      "type": "datetime",
      "default": "now()"
    },
    "updated_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    }
  },
  "relations": {
    "user": {
      "type": "belongs_to",
      "from": "id_user",
      "to": "user.id"
    }
  }
} as const satisfies ModelBase;
