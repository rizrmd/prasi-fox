import type { ModelBase } from "system/model/base";

export const session = {
  "table": "t_session",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "created_at": {
      "type": "datetime"
    },
    "status": {
      "type": "text",
      "default": "active"
    },
    "expired_at": {
      "type": "datetime"
    },
    "device_uuid": {
      "type": "uuid"
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
    },
    "deleted_at": {
      "type": "datetime"
    }
  },
  "relations": {
    "user": {
      "type": "belongs_to",
      "from": "id_user",
      "to": "user.id"
    }
  },
  "label": {
    "title": "Session",
    "record_title": [
      "status",
      "device_uuid"
    ],
    "fields": [
      {
        "status": [
          "Status"
        ]
      },
      {
        "expired_at": [
          "Expired At"
        ]
      },
      {
        "device_uuid": [
          "Device Uuid"
        ]
      },
      {
        "user": [
          "User"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
