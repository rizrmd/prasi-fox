import type { ModelBase } from "system/model/base";

export const staff_role = {
  "table": "m_staff_role",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "name": {
      "type": "text"
    },
    "created_date": {
      "type": "datetime"
    },
    "created_by": {
      "type": "uuid"
    },
    "updated_date": {
      "type": "datetime"
    },
    "updated_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    }
  },
  "relations": {
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "role_menu": {
      "type": "has_many",
      "from": "id",
      "to": "role_menu.id_staff_role"
    },
    "user": {
      "type": "has_many",
      "from": "id",
      "to": "user.id_staff_role"
    },
    "schedule_doctor": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_doctor.id_staff_role"
    },
    "staff_log": {
      "type": "has_many",
      "from": "id",
      "to": "staff_log.id_staff_role"
    },
    "staff": {
      "type": "has_many",
      "from": "id",
      "to": "staff.id_staff_role"
    }
  }
} as const satisfies ModelBase;
