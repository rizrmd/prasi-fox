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
    "updated_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "id_treatment": {
      "type": "uuid"
    },
    "id_medicine": {
      "type": "uuid"
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
      "to": "encounter.id_medical_service"
    }
  },
  "label": {
    "title": "Medical service",
    "record_title": [
      "name",
      "code"
    ],
    "fields": [
      {
        "name": [
          "Name"
        ]
      },
      {
        "code": [
          "Code"
        ]
      },
      {
        "description": [
          "Description"
        ]
      },
      {
        "price": [
          "Price"
        ]
      },
      {
        "id_treatment": [
          "Id Treatment"
        ]
      },
      {
        "id_medicine": [
          "Id Medicine"
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
      }
    ]
  }
} as const satisfies ModelBase;
