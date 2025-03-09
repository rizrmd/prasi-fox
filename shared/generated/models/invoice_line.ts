import type { ModelBase } from "system/model/base";

export const invoice_line = {
  "table": "t_invoice_line",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "description": {
      "type": "text"
    },
    "quantity": {
      "type": "text"
    },
    "unit_price": {
      "type": "text"
    },
    "total_price": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "treatment_name": {
      "type": "text"
    },
    "id_treatment": {
      "type": "uuid"
    },
    "medicine_name": {
      "type": "text"
    },
    "id_medicine": {
      "type": "uuid"
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
    }
  },
  "label": {
    "title": "Invoice line",
    "record_title": [
      "description",
      "quantity"
    ],
    "fields": [
      {
        "description": [
          "Description"
        ]
      },
      {
        "quantity": [
          "Quantity"
        ]
      },
      {
        "unit_price": [
          "Unit Price"
        ]
      },
      {
        "total_price": [
          "Total Price"
        ]
      },
      {
        "treatment_name": [
          "Treatment Name"
        ]
      },
      {
        "id_treatment": [
          "Id Treatment"
        ]
      },
      {
        "medicine_name": [
          "Medicine Name"
        ]
      },
      {
        "id_medicine": [
          "Id Medicine"
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
      }
    ]
  }
} as const satisfies ModelBase;
