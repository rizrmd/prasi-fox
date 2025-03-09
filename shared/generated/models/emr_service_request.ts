import type { ModelBase } from "system/model/base";

export const emr_service_request = {
  "table": "emr_service_request",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "service_request_type": {
      "type": "text"
    },
    "service_request_description": {
      "type": "text"
    },
    "referral_destination": {
      "type": "text"
    },
    "referral_poli": {
      "type": "text"
    },
    "referral_doctor": {
      "type": "text"
    },
    "request_date": {
      "type": "datetime"
    },
    "condition_patient": {
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
    "title": "Emr service request",
    "record_title": [
      "service_request_type",
      "service_request_description"
    ],
    "fields": [
      {
        "service_request_type": [
          "Service Request Type"
        ]
      },
      {
        "service_request_description": [
          "Service Request Description"
        ]
      },
      {
        "referral_destination": [
          "Referral Destination"
        ]
      },
      {
        "referral_poli": [
          "Referral Poli"
        ]
      },
      {
        "referral_doctor": [
          "Referral Doctor"
        ]
      },
      {
        "request_date": [
          "Request Date"
        ]
      },
      {
        "condition_patient": [
          "Condition Patient"
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
