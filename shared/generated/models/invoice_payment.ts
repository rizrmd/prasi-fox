import type { ModelBase } from "system/model/base";

export const invoice_payment = {
  "table": "t_invoice_payment",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "patient_name": {
      "type": "text"
    },
    "invoice_number": {
      "type": "text"
    },
    "payment_date": {
      "type": "datetime"
    },
    "payment_method": {
      "type": "text"
    },
    "amount_paid": {
      "type": "text"
    },
    "reference_number": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "status": {
      "type": "text"
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
    "title": "Invoice payment",
    "record_title": [
      "patient_name",
      "invoice_number"
    ],
    "fields": [
      {
        "patient_name": [
          "Patient Name"
        ]
      },
      {
        "invoice_number": [
          "Invoice Number"
        ]
      },
      {
        "payment_date": [
          "Payment Date"
        ]
      },
      {
        "payment_method": [
          "Payment Method"
        ]
      },
      {
        "amount_paid": [
          "Amount Paid"
        ]
      },
      {
        "reference_number": [
          "Reference Number"
        ]
      },
      {
        "status": [
          "Status"
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
