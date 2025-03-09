import type { ModelBase } from "system/model/base";

export const treatment = {
  "table": "m_treatment",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "code": {
      "type": "text"
    },
    "name": {
      "type": "text"
    },
    "version": {
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
    "emr_diagnosis_treatment": {
      "type": "has_many",
      "from": "id",
      "to": "emr_diagnosis_treatment.id_treatment"
    },
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    }
  },
  "label": {
    "title": "Treatment",
    "record_title": [
      "code",
      "name"
    ],
    "fields": [
      {
        "code": [
          "Code"
        ]
      },
      {
        "name": [
          "Name"
        ]
      },
      {
        "version": [
          "Version"
        ]
      },
      {
        "emr_diagnosis_treatment": [
          "Emr Diagnosis Treatment"
        ]
      },
      {
        "client": [
          "Client"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
