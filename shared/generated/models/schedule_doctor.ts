import type { ModelBase } from "system/model/base";

export const schedule_doctor = {
  "table": "m_schedule_doctor",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "doctor_name": {
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
    "day": {
      "type": "text"
    },
    "start_time": {
      "type": "datetime"
    },
    "end_time": {
      "type": "datetime"
    }
  },
  "relations": {
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "staff_role": {
      "type": "belongs_to",
      "from": "id_staff_role",
      "to": "staff_role.id"
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
