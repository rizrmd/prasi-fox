import type { ModelBase } from "system/model/base";

export const prescriptions_queue = {
  "table": "t_prescriptions_queue",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "queue_number": {
      "type": "text"
    },
    "patient_name": {
      "type": "text"
    },
    "doctor_name": {
      "type": "text"
    },
    "date": {
      "type": "datetime"
    },
    "prescription_status": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "id_medicine": {
      "type": "uuid"
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
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_prescription_queue"
    },
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "doctor": {
      "type": "belongs_to",
      "from": "id_doctor",
      "to": "staff.id"
    },
    "encounter": {
      "type": "belongs_to",
      "from": "id_encounter",
      "to": "encounter.id"
    },
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
    },
    "prescription": {
      "type": "belongs_to",
      "from": "id_prescription",
      "to": "prescriptions.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    }
  },
  "label": {
    "title": "Prescriptions queue",
    "record_title": [
      "queue_number",
      "patient_name"
    ],
    "fields": [
      {
        "queue_number": [
          "Queue Number"
        ]
      },
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
        "date": [
          "Date"
        ]
      },
      {
        "prescription_status": [
          "Prescription Status"
        ]
      },
      {
        "id_medicine": [
          "Id Medicine"
        ]
      },
      {
        "invoice": [
          "Invoice"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "doctor": [
          "Doctor"
        ]
      },
      {
        "encounter": [
          "Encounter"
        ]
      },
      {
        "patient": [
          "Patient"
        ]
      },
      {
        "prescription": [
          "Prescription"
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
