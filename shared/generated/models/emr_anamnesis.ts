import type { ModelBase } from "system/model/base";

export const emr_anamnesis = {
  "table": "emr_anamnesis",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "condition_patient": {
      "type": "text"
    },
    "medical_history": {
      "type": "text"
    },
    "familymember_history": {
      "type": "text"
    },
    "allergy_intolerance": {
      "type": "text"
    },
    "medication_statement": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "created_date": {
      "type": "datetime"
    },
    "deleted_date": {
      "type": "datetime"
    },
    "updated_date": {
      "type": "datetime",
      "default": "now()"
    },
    "updated_by": {
      "type": "uuid"
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
    "emr": {
      "type": "belongs_to",
      "from": "id_emr",
      "to": "emr.id"
    }
  }
} as const satisfies ModelBase;
