import type { ModelBase } from "system/model/base";

export const satusehat_log = {
  "table": "t_satusehat_log",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "endpoint": {
      "type": "text"
    },
    "request_body": {
      "type": "json"
    },
    "response_body": {
      "type": "json"
    },
    "status_code": {
      "type": "number"
    },
    "status": {
      "type": "text"
    },
    "error_message": {
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
    "resource_data": {
      "type": "json",
      "default": "{}"
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
    }
  }
} as const satisfies ModelBase;
