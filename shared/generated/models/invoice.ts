import type { ModelBase } from "system/model/base";

export const invoice = {
  "table": "t_invoice",
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
    "invoice_date": {
      "type": "datetime"
    },
    "total_amount": {
      "type": "text"
    },
    "status": {
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
    "bpjs_log": {
      "type": "has_many",
      "from": "id",
      "to": "bpjs_log.id_invoice"
    },
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "encounter": {
      "type": "belongs_to",
      "from": "id_encounter",
      "to": "encounter.id"
    },
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
    },
    "prescription": {
      "type": "belongs_to",
      "from": "id_prescription",
      "to": "prescriptions.id"
    },
    "prescription_queue": {
      "type": "belongs_to",
      "from": "id_prescription_queue",
      "to": "prescriptions_queue.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "invoice_claim": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_claim.id_invoice"
    },
    "invoice_line": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_line.id_invoice"
    },
    "invoice_payment": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_payment.id_invoice"
    }
  },
  "label": {
    "title": "Invoice",
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
        "invoice_date": [
          "Invoice Date"
        ]
      },
      {
        "total_amount": [
          "Total Amount"
        ]
      },
      {
        "status": [
          "Status"
        ]
      },
      {
        "bpjs_log": [
          "Bpjs Log"
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
        "patient": [
          "Patient"
        ]
      },
      {
        "prescription": [
          "Prescription"
        ]
      },
      {
        "prescription_queue": [
          "Prescription Queue"
        ]
      },
      {
        "staff": [
          "Staff"
        ]
      },
      {
        "invoice_claim": [
          "Invoice Claim"
        ]
      },
      {
        "invoice_line": [
          "Invoice Line"
        ]
      },
      {
        "invoice_payment": [
          "Invoice Payment"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
