import type { ModelBase } from "system/model/base";

export const patient = {
  "table": "m_patient",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "name": {
      "type": "text"
    },
    "nik": {
      "type": "text"
    },
    "birth_date": {
      "type": "datetime"
    },
    "birth_place": {
      "type": "text"
    },
    "gender": {
      "type": "text"
    },
    "address": {
      "type": "text"
    },
    "phone_number": {
      "type": "text"
    },
    "ihs_number": {
      "type": "text"
    },
    "emr_number": {
      "type": "text"
    },
    "bpjs_number": {
      "type": "text"
    },
    "multiple_birth": {
      "type": "boolean"
    },
    "linked_patient_id": {
      "type": "uuid"
    },
    "relationship_type": {
      "type": "text"
    },
    "created_date": {
      "type": "datetime"
    },
    "created_by": {
      "type": "uuid"
    },
    "updated_by": {
      "type": "uuid"
    },
    "updated_date": {
      "type": "datetime"
    },
    "deleted_at": {
      "type": "datetime"
    }
  },
  "relations": {
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "invoice_payment": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_payment.id_patient"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_patient"
    },
    "prescriptions_queue": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions_queue.id_patient"
    },
    "bpjs_log": {
      "type": "has_many",
      "from": "id",
      "to": "bpjs_log.id_patient"
    },
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_patient"
    },
    "prescriptions": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions.id_patient"
    },
    "patient_queue": {
      "type": "has_many",
      "from": "id",
      "to": "patient_queue.id_patient"
    },
    "patient_room": {
      "type": "has_many",
      "from": "id",
      "to": "patient_room.id_patient"
    },
    "emr": {
      "type": "has_many",
      "from": "id",
      "to": "emr.id_patient"
    },
    "invoice_claim": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_claim.id_patient"
    }
  }
} as const satisfies ModelBase;
