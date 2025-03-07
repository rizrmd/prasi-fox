import type { ModelBase } from "system/model/base";

export const emr_service_request = {
  "table": "emr_service_request",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "service_request_type": {
      "type": "text"
    },
    "service_request_description": {
      "type": "text"
    },
    "referral_destination": {
      "type": "text"
    },
    "referral_poli": {
      "type": "text"
    },
    "referral_doctor": {
      "type": "text"
    },
    "request_date": {
      "type": "datetime"
    },
    "condition_patient": {
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
    "emr": {
      "type": "belongs_to",
      "from": "id_emr",
      "to": "emr.id"
    }
  }
} as const satisfies ModelBase;
