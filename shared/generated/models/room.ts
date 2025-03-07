import type { ModelBase } from "system/model/base";

export const room = {
  "table": "m_room",
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
    "service_class": {
      "type": "text"
    },
    "longitude": {
      "type": "text"
    },
    "latitude": {
      "type": "text"
    },
    "description": {
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
      "to": "encounter.id_room"
    },
    "patient_room": {
      "type": "has_many",
      "from": "id",
      "to": "patient_room.id_room"
    }
  }
} as const satisfies ModelBase;
