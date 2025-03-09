import type { ModelBase } from "system/model/base";

export const medicine = {
  "table": "m_medicine",
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
    "package": {
      "type": "text"
    },
    "stock": {
      "type": "text"
    },
    "expired_date": {
      "type": "datetime"
    },
    "manufacturer": {
      "type": "text"
    },
    "is_fast_moving": {
      "type": "boolean"
    },
    "dosage": {
      "type": "text"
    },
    "price": {
      "type": "text"
    },
    "ingredients": {
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
    "category": {
      "type": "text"
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
      "to": "emr_diagnosis_treatment.id_medicine"
    },
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "prescriptions": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions.id_medicine"
    }
  },
  "label": {
    "title": "Medicine",
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
        "package": [
          "Package"
        ]
      },
      {
        "stock": [
          "Stock"
        ]
      },
      {
        "expired_date": [
          "Expired Date"
        ]
      },
      {
        "manufacturer": [
          "Manufacturer"
        ]
      },
      {
        "is_fast_moving": [
          "Is Fast Moving"
        ]
      },
      {
        "dosage": [
          "Dosage"
        ]
      },
      {
        "price": [
          "Price"
        ]
      },
      {
        "ingredients": [
          "Ingredients"
        ]
      },
      {
        "category": [
          "Category"
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
      },
      {
        "prescriptions": [
          "Prescriptions"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
