import type { ModelBase } from "system/model/base";

export const menu = {
  "table": "m_menu",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "id_parent": {
      "type": "uuid"
    },
    "name": {
      "type": "text"
    },
    "url_menu": {
      "type": "text"
    },
    "is_active": {
      "type": "boolean"
    },
    "sequence": {
      "type": "number"
    },
    "created_at": {
      "type": "datetime"
    },
    "update_at": {
      "type": "datetime"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "description": {
      "type": "text"
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
      "to": "role_menu.id_menu"
    },
    "user_menu": {
      "type": "has_many",
      "from": "id",
      "to": "user_menu.id_menu"
    }
  }
} as const satisfies ModelBase;
