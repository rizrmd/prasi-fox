import type { ModelBase } from "system/model/base";

export const medical_service = {
  "table": "m_medical_service",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "name": {
      "type": "text"
    },
    "code": {
      "type": "text"
    },
    "description": {
      "type": "text"
    },
    "price": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "created_date": {
      "type": "datetime"
    },
    "updated_by": {
      "type": "uuid"
    },
    "updated_date": {
      "type": "datetime"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "id_treatment": {
      "type": "uuid"
    },
    "id_medicine": {
      "type": "uuid"
    }
  },
  "relations": {
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_medical_service"
    }
  }
} as const satisfies ModelBase;
