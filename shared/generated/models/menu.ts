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
    "deleted_at": {
      "type": "datetime"
    },
    "description": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "updated_at": {
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
  },
  "label": {
    "title": "Menu",
    "record_title": [
      "id_parent",
      "name"
    ],
    "fields": [
      {
        "id_parent": [
          "Id Parent"
        ]
      },
      {
        "name": [
          "Name"
        ]
      },
      {
        "url_menu": [
          "Url Menu"
        ]
      },
      {
        "is_active": [
          "Is Active"
        ]
      },
      {
        "sequence": [
          "Sequence"
        ]
      },
      {
        "description": [
          "Description"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "role_menu": [
          "Role Menu"
        ]
      },
      {
        "user_menu": [
          "User Menu"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
