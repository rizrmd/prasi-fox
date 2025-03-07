import type { ModelBase } from "system/model/base";

export const patient_queue = {
  "table": "t_patient_queue",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "patient_name": {
      "type": "text"
    },
    "queue_number": {
      "type": "text"
    },
    "registered_date": {
      "type": "datetime"
    },
    "patient_phone": {
      "type": "text"
    },
    "channel_name": {
      "type": "text"
    },
    "queue_status": {
      "type": "text"
    },
    "reschedule_date": {
      "type": "datetime"
    },
    "referral_letter_number": {
      "type": "text"
    },
    "referring_physician": {
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
    "is_referred": {
      "type": "boolean"
    },
    "reservation_doctor": {
      "type": "text"
    },
    "reservation_poli": {
      "type": "text"
    },
    "reservation_date": {
      "type": "datetime"
    },
    "contact_name": {
      "type": "text"
    },
    "contact_phone": {
      "type": "text"
    },
    "has_bpjs": {
      "type": "boolean",
      "default": "true"
    },
    "bpjs_number": {
      "type": "text"
    },
    "referring_faskes": {
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
    "poli": {
      "type": "belongs_to",
      "from": "id_poli",
      "to": "poli.id"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_patient_queue"
    }
  }
} as const satisfies ModelBase;
