import type { ModelBase } from "system/model/base";

export const emr_observation = {
  "table": "emr_observation",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "heart_rate": {
      "type": "text"
    },
    "breaths": {
      "type": "text"
    },
    "blood_pressure": {
      "type": "text"
    },
    "body_temperature": {
      "type": "text"
    },
    "responsiveness": {
      "type": "text"
    },
    "body_height": {
      "type": "text"
    },
    "body_weight": {
      "type": "text"
    },
    "mental_status": {
      "type": "text"
    },
    "created_by": {
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
  },
  "label": {
    "title": "Emr observation",
    "record_title": [
      "heart_rate",
      "breaths"
    ],
    "fields": [
      {
        "heart_rate": [
          "Heart Rate"
        ]
      },
      {
        "breaths": [
          "Breaths"
        ]
      },
      {
        "blood_pressure": [
          "Blood Pressure"
        ]
      },
      {
        "body_temperature": [
          "Body Temperature"
        ]
      },
      {
        "responsiveness": [
          "Responsiveness"
        ]
      },
      {
        "body_height": [
          "Body Height"
        ]
      },
      {
        "body_weight": [
          "Body Weight"
        ]
      },
      {
        "mental_status": [
          "Mental Status"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "emr": [
          "Emr"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
