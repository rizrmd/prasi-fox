import type { ModelBase } from "system/model/base";

export const poli = {
  "table": "m_poli",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "name": {
      "type": "text"
    },
    "status": {
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
    "poli_code": {
      "type": "text"
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
    "schedule_doctor": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_doctor.id_poli"
    },
    "schedule_poli": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_poli.id_poli"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_poli"
    },
    "patient_queue": {
      "type": "has_many",
      "from": "id",
      "to": "patient_queue.id_poli"
    }
  },
  "label": {
    "title": "Poli",
    "record_title": [
      "name",
      "status"
    ],
    "fields": [
      {
        "name": [
          "Name"
        ]
      },
      {
        "status": [
          "Status"
        ]
      },
      {
        "poli_code": [
          "Poli Code"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "schedule_doctor": [
          "Schedule Doctor"
        ]
      },
      {
        "schedule_poli": [
          "Schedule Poli"
        ]
      },
      {
        "encounter": [
          "Encounter"
        ]
      },
      {
        "patient_queue": [
          "Patient Queue"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
