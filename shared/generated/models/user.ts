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
    "created_by": {
      "type": "uuid"
    },
    "updated_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "created_at": {
      "type": "datetime",
      "default": "now()"
    },
    "updated_at": {
      "type": "datetime",
      "default": "now()"
    },
    "role": {
      "type": "text"
    }
  },
  "relations": {
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "user_menu": {
      "type": "has_many",
      "from": "id",
      "to": "user_menu.id_user"
    },
    "session": {
      "type": "has_many",
      "from": "id",
      "to": "session.id_user"
    }
  },
  "label": {
    "title": "User",
    "record_title": [
      "display_name",
      "email"
    ],
    "fields": [
      {
        "display_name": [
          "Display Name"
        ]
      },
      {
        "email": [
          "Email"
        ]
      },
      {
        "password": [
          "Password"
        ]
      },
      {
        "username": [
          "Username"
        ]
      },
      {
        "role": [
          "Role"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "staff": [
          "Staff"
        ]
      },
      {
        "user_menu": [
          "User Menu"
        ]
      },
      {
        "session": [
          "Session"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
