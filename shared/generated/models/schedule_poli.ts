import type { ModelBase } from "system/model/base";

export const schedule_poli = {
  "table": "m_schedule_poli",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "poli_name": {
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
    "day": {
      "type": "text"
    },
    "start_time": {
      "type": "datetime"
    },
    "end_time": {
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
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "poli": {
      "type": "belongs_to",
      "from": "id_poli",
      "to": "poli.id"
    }
  }
} as const satisfies ModelBase;
