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
    "created_date": {
      "type": "datetime"
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
    "updated_date": {
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
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
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
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "prescriptions_queue": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions_queue.id_prescription"
    },
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_prescription"
    }
  }
} as const satisfies ModelBase;
