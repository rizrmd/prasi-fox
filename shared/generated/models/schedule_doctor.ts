import type { ModelBase } from "system/model/base";

export const schedule_doctor = {
  "table": "m_schedule_doctor",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "doctor_name": {
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
    },
    "staff_role": {
      "type": "belongs_to",
      "from": "id_staff_role",
      "to": "staff_role.id"
    }
  },
  "label": {
    "title": "Schedule doctor",
    "record_title": [
      "doctor_name",
      "day"
    ],
    "fields": [
      {
        "doctor_name": [
          "Doctor Name"
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
      },
      {
        "staff_role": [
          "Staff Role"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
