import type { ModelBase } from "system/model/base";

export const role_menu = {
  "table": "m_role_menu",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "url_pattern": {
      "type": "text"
    },
    "created_date": {
      "type": "datetime"
    },
    "updated_date": {
      "type": "datetime"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "created_by": {
      "type": "uuid"
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
    "menu": {
      "type": "belongs_to",
      "from": "id_menu",
      "to": "menu.id"
    }
  }
} as const satisfies ModelBase;
