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
    "created_date": {
      "type": "datetime"
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
    "updated_date": {
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
  }
} as const satisfies ModelBase;
