import type { ModelBase } from "system/model/base";

export const medicine = {
  "table": "m_medicine",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "code": {
      "type": "text"
    },
    "name": {
      "type": "text"
    },
    "package": {
      "type": "text"
    },
    "stock": {
      "type": "text"
    },
    "expired_date": {
      "type": "datetime"
    },
    "manufacturer": {
      "type": "text"
    },
    "is_fast_moving": {
      "type": "boolean"
    },
    "dosage": {
      "type": "text"
    },
    "price": {
      "type": "text"
    },
    "ingredients": {
      "type": "text"
    },
    "created_date": {
      "type": "datetime",
      "default": "now()"
    },
    "updated_date": {
      "type": "datetime"
    },
    "created_by": {
      "type": "uuid"
    },
    "updated_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "category": {
      "type": "text"
    }
  },
  "relations": {
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "prescriptions": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions.id_medicine"
    },
    "emr_diagnosis_treatment": {
      "type": "has_many",
      "from": "id",
      "to": "emr_diagnosis_treatment.id_medicine"
    }
  }
} as const satisfies ModelBase;
