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
    "deleted_at": {
      "type": "datetime"
    },
    "created_at": {
      "type": "datetime",
      "default": "now()"
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
    "menu": {
      "type": "belongs_to",
      "from": "id_menu",
      "to": "menu.id"
    },
    "staff_role": {
      "type": "belongs_to",
      "from": "id_staff_role",
      "to": "staff_role.id"
    }
  },
  "label": {
    "title": "Role menu",
    "record_title": [
      "url_pattern"
    ],
    "fields": [
      {
        "url_pattern": [
          "Url Pattern"
        ]
      },
      {
        "created_date": [
          "Created Date"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "menu": [
          "Menu"
        ]
      },
      {
        "staff_role": [
          "Staff Role"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
