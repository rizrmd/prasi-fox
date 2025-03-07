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
    "created_date": {
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
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "room": {
      "type": "belongs_to",
      "from": "id_room",
      "to": "room.id"
    },
    "poli": {
      "type": "belongs_to",
      "from": "id_poli",
      "to": "poli.id"
    },
    "prescriptions_queue": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions_queue.id_encounter"
    },
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_encounter"
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
    "patient_queue": {
      "type": "belongs_to",
      "from": "id_patient_queue",
      "to": "patient_queue.id"
    }
  }
} as const satisfies ModelBase;
