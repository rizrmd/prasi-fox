import type { ModelBase } from "system/model/base";

export const encounter = {
  "table": "t_encounter",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "patient_name": {
      "type": "text"
    },
    "doctor_name": {
      "type": "text"
    },
    "encounter_type": {
      "type": "text"
    },
    "encounter_date": {
      "type": "datetime"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "status": {
      "type": "text"
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
    "emr_patient": {
      "type": "belongs_to",
      "from": "id_emr_patient",
      "to": "emr.id"
    },
    "medical_service": {
      "type": "belongs_to",
      "from": "id_medical_service",
      "to": "medical_service.id"
    },
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
    },
    "patient_queue": {
      "type": "belongs_to",
      "from": "id_patient_queue",
      "to": "patient_queue.id"
    },
    "poli": {
      "type": "belongs_to",
      "from": "id_poli",
      "to": "poli.id"
    },
    "room": {
      "type": "belongs_to",
      "from": "id_room",
      "to": "room.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_encounter"
    },
    "prescriptions_queue": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions_queue.id_encounter"
    }
  },
  "label": {
    "title": "Encounter",
    "record_title": [
      "patient_name",
      "doctor_name"
    ],
    "fields": [
      {
        "patient_name": [
          "Patient Name"
        ]
      },
      {
        "doctor_name": [
          "Doctor Name"
        ]
      },
      {
        "encounter_type": [
          "Encounter Type"
        ]
      },
      {
        "encounter_date": [
          "Encounter Date"
        ]
      },
      {
        "status": [
          "Status"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "emr_patient": [
          "Emr Patient"
        ]
      },
      {
        "medical_service": [
          "Medical Service"
        ]
      },
      {
        "patient": [
          "Patient"
        ]
      },
      {
        "patient_queue": [
          "Patient Queue"
        ]
      },
      {
        "poli": [
          "Poli"
        ]
      },
      {
        "room": [
          "Room"
        ]
      },
      {
        "staff": [
          "Staff"
        ]
      },
      {
        "invoice": [
          "Invoice"
        ]
      },
      {
        "prescriptions_queue": [
          "Prescriptions Queue"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
