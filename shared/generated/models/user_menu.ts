import type { ModelBase } from "system/model/base";

export const user_menu = {
  "table": "m_user_menu",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
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
    "menu": {
      "type": "belongs_to",
      "from": "id_menu",
      "to": "menu.id"
    },
    "user": {
      "type": "belongs_to",
      "from": "id_user",
      "to": "user.id"
    }
  }
} as const satisfies ModelBase;
