import type { ModelBase } from "system/model/base";

export const emr_diagnosis_treatment = {
  "table": "emr_diagnosis_treatment",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "diagnosis": {
      "type": "text"
    },
    "treatment": {
      "type": "text"
    },
    "medicine": {
      "type": "text"
    },
    "medicine_rules": {
      "type": "text"
    },
    "notes": {
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
    "diagnosis": {
      "type": "belongs_to",
      "from": "id_diagnosis",
      "to": "diagnosis.id"
    },
    "emr": {
      "type": "belongs_to",
      "from": "id_emr",
      "to": "emr.id"
    },
    "medicine": {
      "type": "belongs_to",
      "from": "id_medicine",
      "to": "medicine.id"
    },
    "treatment": {
      "type": "belongs_to",
      "from": "id_treatment",
      "to": "treatment.id"
    }
  },
  "label": {
    "title": "Emr diagnosis treatment",
    "record_title": [
      "diagnosis",
      "treatment"
    ],
    "fields": [
      {
        "diagnosis": [
          "Diagnosis"
        ]
      },
      {
        "treatment": [
          "Treatment"
        ]
      },
      {
        "medicine": [
          "Medicine"
        ]
      },
      {
        "medicine_rules": [
          "Medicine Rules"
        ]
      },
      {
        "notes": [
          "Notes"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "diagnosis": [
          "Diagnosis"
        ]
      },
      {
        "emr": [
          "Emr"
        ]
      },
      {
        "medicine": [
          "Medicine"
        ]
      },
      {
        "treatment": [
          "Treatment"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
