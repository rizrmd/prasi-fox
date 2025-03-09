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
    }
  },
  "relations": {
    "role_menu": {
      "type": "has_many",
      "from": "id",
      "to": "role_menu.id_staff_role"
    },
    "schedule_doctor": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_doctor.id_staff_role"
    },
    "staff": {
      "type": "has_many",
      "from": "id",
      "to": "staff.id_staff_role"
    },
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "staff_log": {
      "type": "has_many",
      "from": "id",
      "to": "staff_log.id_staff_role"
    }
  },
  "label": {
    "title": "Staff role",
    "record_title": [
      "name"
    ],
    "fields": [
      {
        "name": [
          "Name"
        ]
      },
      {
        "role_menu": [
          "Role Menu"
        ]
      },
      {
        "schedule_doctor": [
          "Schedule Doctor"
        ]
      },
      {
        "staff": [
          "Staff"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "staff_log": [
          "Staff Log"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
