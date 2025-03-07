import type { ModelBase } from "system/model/base";

export const treatment = {
  "table": "m_treatment",
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
    "version": {
      "type": "text"
    },
    "created_date": {
      "type": "datetime"
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
    }
  },
  "relations": {
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "emr_diagnosis_treatment": {
      "type": "has_many",
      "from": "id",
      "to": "emr_diagnosis_treatment.id_treatment"
    }
  }
} as const satisfies ModelBase;
