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
    "created_by": {
      "type": "uuid"
    },
    "updated_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "created_at": {
      "type": "datetime",
      "default": "now()"
    },
    "updated_at": {
      "type": "datetime",
      "default": "now()"
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
  },
  "label": {
    "title": "Room",
    "record_title": [
      "name",
      "status"
    ],
    "fields": [
      {
        "name": [
          "Name"
        ]
      },
      {
        "status": [
          "Status"
        ]
      },
      {
        "service_class": [
          "Service Class"
        ]
      },
      {
        "longitude": [
          "Longitude"
        ]
      },
      {
        "latitude": [
          "Latitude"
        ]
      },
      {
        "description": [
          "Description"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "encounter": [
          "Encounter"
        ]
      },
      {
        "patient_room": [
          "Patient Room"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
