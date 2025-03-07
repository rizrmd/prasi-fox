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
    "created_date": {
      "type": "datetime"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
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
    "invoice_payment": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_payment.id_invoice"
    },
    "bpjs_log": {
      "type": "has_many",
      "from": "id",
      "to": "bpjs_log.id_invoice"
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
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
    },
    "staff": {
      "type": "belongs_to",
      "from": "id_staff",
      "to": "staff.id"
    },
    "encounter": {
      "type": "belongs_to",
      "from": "id_encounter",
      "to": "encounter.id"
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
    }
  }
} as const satisfies ModelBase;
