import type { ModelBase } from "system/model/base";

export const staff_log = {
  "table": "t_staff_log",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "staff_name": {
      "type": "text"
    },
    "staff_role": {
      "type": "text"
    },
    "activity_type": {
      "type": "text"
    },
    "activity_description": {
      "type": "text"
    },
    "date": {
      "type": "datetime"
    },
    "created_date": {
      "type": "datetime"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "updated_date": {
      "type": "datetime",
      "default": "now()"
    },
    "updated_by": {
      "type": "uuid"
    }
  },
  "relations": {
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "staff_role": {
      "type": "belongs_to",
      "from": "id_staff_role",
      "to": "staff_role.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    }
  }
} as const satisfies ModelBase;
