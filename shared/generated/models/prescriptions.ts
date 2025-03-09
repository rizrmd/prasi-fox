import type { ModelBase } from "system/model/base";

export const prescriptions = {
  "table": "t_prescriptions",
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
    "medicine_code": {
      "type": "text"
    },
    "medicine_name": {
      "type": "text"
    },
    "dosage": {
      "type": "text"
    },
    "dosage_instructions": {
      "type": "text"
    },
    "notes": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "quantity": {
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
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_prescription"
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
    "emr": {
      "type": "belongs_to",
      "from": "id_emr",
      "to": "emr.id"
    },
    "medicine": {
      "type": "belongs_to",
      "from": "id_medicine",
      "to": "medicine.id"
    },
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "prescriptions_queue": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions_queue.id_prescription"
    }
  },
  "label": {
    "title": "Prescriptions",
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
        "medicine_code": [
          "Medicine Code"
        ]
      },
      {
        "medicine_name": [
          "Medicine Name"
        ]
      },
      {
        "dosage": [
          "Dosage"
        ]
      },
      {
        "dosage_instructions": [
          "Dosage Instructions"
        ]
      },
      {
        "notes": [
          "Notes"
        ]
      },
      {
        "quantity": [
          "Quantity"
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
        "emr": [
          "Emr"
        ]
      },
      {
        "medicine": [
          "Medicine"
        ]
      },
      {
        "patient": [
          "Patient"
        ]
      },
      {
        "staff": [
          "Staff"
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
