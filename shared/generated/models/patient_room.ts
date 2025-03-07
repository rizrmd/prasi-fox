import type { ModelBase } from "system/model/base";

export const patient_room = {
  "table": "t_patient_room",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "patient_name": {
      "type": "text"
    },
    "contact_name": {
      "type": "text"
    },
    "phone_number": {
      "type": "text"
    },
    "admission_date": {
      "type": "datetime"
    },
    "referral_letter_number": {
      "type": "text"
    },
    "referring_physician": {
      "type": "text"
    },
    "room_name": {
      "type": "text"
    },
    "doctor_name": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "created_date": {
      "type": "datetime"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "admission_reason": {
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
    "room": {
      "type": "belongs_to",
      "from": "id_room",
      "to": "room.id"
    }
  }
} as const satisfies ModelBase;
