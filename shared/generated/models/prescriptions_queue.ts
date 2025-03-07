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
    "created_date": {
      "type": "datetime"
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
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "encounter": {
      "type": "belongs_to",
      "from": "id_encounter",
      "to": "encounter.id"
    },
    "prescription": {
      "type": "belongs_to",
      "from": "id_prescription",
      "to": "prescriptions.id"
    },
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_prescription_queue"
    }
  }
} as const satisfies ModelBase;
