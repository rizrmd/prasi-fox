import type { ModelBase } from "system/model/base";

export const schedule_poli = {
  "table": "m_schedule_poli",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "poli_name": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "day": {
      "type": "text"
    },
    "start_time": {
      "type": "datetime"
    },
    "end_time": {
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
    "poli": {
      "type": "belongs_to",
      "from": "id_poli",
      "to": "poli.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    }
  },
  "label": {
    "title": "Schedule poli",
    "record_title": [
      "poli_name",
      "day"
    ],
    "fields": [
      {
        "poli_name": [
          "Poli Name"
        ]
      },
      {
        "day": [
          "Day"
        ]
      },
      {
        "start_time": [
          "Start Time"
        ]
      },
      {
        "end_time": [
          "End Time"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "poli": [
          "Poli"
        ]
      },
      {
        "staff": [
          "Staff"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
