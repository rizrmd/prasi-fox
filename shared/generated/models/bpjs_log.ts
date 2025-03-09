import type { ModelBase } from "system/model/base";

export const bpjs_log = {
  "table": "t_bpjs_log",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "patient_name": {
      "type": "text"
    },
    "bpjs_number": {
      "type": "text"
    },
    "transaction_date": {
      "type": "datetime"
    },
    "claim_amount": {
      "type": "text"
    },
    "claim_status": {
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
    "invoice": {
      "type": "belongs_to",
      "from": "id_invoice",
      "to": "invoice.id"
    },
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
    }
  },
  "label": {
    "title": "Bpjs log",
    "record_title": [
      "patient_name",
      "bpjs_number"
    ],
    "fields": [
      {
        "patient_name": [
          "Patient Name"
        ]
      },
      {
        "bpjs_number": [
          "Bpjs Number"
        ]
      },
      {
        "transaction_date": [
          "Transaction Date"
        ]
      },
      {
        "claim_amount": [
          "Claim Amount"
        ]
      },
      {
        "claim_status": [
          "Claim Status"
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
        "invoice": [
          "Invoice"
        ]
      },
      {
        "patient": [
          "Patient"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
