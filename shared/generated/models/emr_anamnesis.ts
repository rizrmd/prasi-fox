import type { ModelBase } from "system/model/base";

export const emr_anamnesis = {
  "table": "emr_anamnesis",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "condition_patient": {
      "type": "text"
    },
    "medical_history": {
      "type": "text"
    },
    "familymember_history": {
      "type": "text"
    },
    "allergy_intolerance": {
      "type": "text"
    },
    "medication_statement": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_date": {
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
    "emr": {
      "type": "belongs_to",
      "from": "id_emr",
      "to": "emr.id"
    }
  },
  "label": {
    "title": "Emr anamnesis",
    "record_title": [
      "condition_patient",
      "medical_history"
    ],
    "fields": [
      {
        "condition_patient": [
          "Condition Patient"
        ]
      },
      {
        "medical_history": [
          "Medical History"
        ]
      },
      {
        "familymember_history": [
          "Familymember History"
        ]
      },
      {
        "allergy_intolerance": [
          "Allergy Intolerance"
        ]
      },
      {
        "medication_statement": [
          "Medication Statement"
        ]
      },
      {
        "deleted_date": [
          "Deleted Date"
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
