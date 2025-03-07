import type { ModelBase } from "system/model/base";

export const user = {
  "table": "m_user",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "display_name": {
      "type": "text"
    },
    "email": {
      "type": "text"
    },
    "password": {
      "type": "text"
    },
    "username": {
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
    "staff_role": {
      "type": "belongs_to",
      "from": "id_staff_role",
      "to": "staff_role.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "session": {
      "type": "has_many",
      "from": "id",
      "to": "session.id_user"
    },
    "user_menu": {
      "type": "has_many",
      "from": "id",
      "to": "user_menu.id_user"
    }
  }
} as const satisfies ModelBase;
