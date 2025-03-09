import type { ModelBase } from "system/model/base";

export const invoice_claim = {
  "table": "t_invoice_claim",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "invoice_number": {
      "type": "text"
    },
    "patient_name": {
      "type": "text"
    },
    "claim_date": {
      "type": "datetime"
    },
    "payer_type": {
      "type": "text"
    },
    "payer_number": {
      "type": "text"
    },
    "claim_amount": {
      "type": "text"
    },
    "approved_amount": {
      "type": "text"
    },
    "claim_status": {
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
    "title": "Invoice claim",
    "record_title": [
      "invoice_number",
      "patient_name"
    ],
    "fields": [
      {
        "invoice_number": [
          "Invoice Number"
        ]
      },
      {
        "patient_name": [
          "Patient Name"
        ]
      },
      {
        "claim_date": [
          "Claim Date"
        ]
      },
      {
        "payer_type": [
          "Payer Type"
        ]
      },
      {
        "payer_number": [
          "Payer Number"
        ]
      },
      {
        "claim_amount": [
          "Claim Amount"
        ]
      },
      {
        "approved_amount": [
          "Approved Amount"
        ]
      },
      {
        "claim_status": [
          "Claim Status"
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
