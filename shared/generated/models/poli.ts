import type { ModelBase } from "system/model/base";

export const poli = {
  "table": "m_poli",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "name": {
      "type": "text"
    },
    "status": {
      "type": "text"
    },
    "created_date": {
      "type": "datetime"
    },
    "created_by": {
      "type": "uuid"
    },
    "updated_date": {
      "type": "datetime"
    },
    "updated_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "poli_code": {
      "type": "text"
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
      "to": "encounter.id_poli"
    },
    "schedule_poli": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_poli.id_poli"
    },
    "schedule_doctor": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_doctor.id_poli"
    },
    "patient_queue": {
      "type": "has_many",
      "from": "id",
      "to": "patient_queue.id_poli"
    }
  }
} as const satisfies ModelBase;
