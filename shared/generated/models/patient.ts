import type { ModelBase } from "system/model/base";

export const patient = {
  "table": "m_patient",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "name": {
      "type": "text"
    },
    "nik": {
      "type": "text"
    },
    "birth_date": {
      "type": "datetime"
    },
    "birth_place": {
      "type": "text"
    },
    "gender": {
      "type": "text"
    },
    "address": {
      "type": "text"
    },
    "phone_number": {
      "type": "text"
    },
    "ihs_number": {
      "type": "text"
    },
    "emr_number": {
      "type": "text"
    },
    "bpjs_number": {
      "type": "text"
    },
    "multiple_birth": {
      "type": "boolean"
    },
    "linked_patient_id": {
      "type": "uuid"
    },
    "relationship_type": {
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
    "emr": {
      "type": "has_many",
      "from": "id",
      "to": "emr.id_patient"
    },
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "bpjs_log": {
      "type": "has_many",
      "from": "id",
      "to": "bpjs_log.id_patient"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_patient"
    },
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_patient"
    },
    "invoice_claim": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_claim.id_patient"
    },
    "invoice_payment": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_payment.id_patient"
    },
    "patient_queue": {
      "type": "has_many",
      "from": "id",
      "to": "patient_queue.id_patient"
    },
    "patient_room": {
      "type": "has_many",
      "from": "id",
      "to": "patient_room.id_patient"
    },
    "prescriptions": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions.id_patient"
    },
    "prescriptions_queue": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions_queue.id_patient"
    }
  },
  "label": {
    "title": "Patient",
    "record_title": [
      "name",
      "nik"
    ],
    "fields": [
      {
        "name": [
          "Name"
        ]
      },
      {
        "nik": [
          "Nik"
        ]
      },
      {
        "birth_date": [
          "Birth Date"
        ]
      },
      {
        "birth_place": [
          "Birth Place"
        ]
      },
      {
        "gender": [
          "Gender"
        ]
      },
      {
        "address": [
          "Address"
        ]
      },
      {
        "phone_number": [
          "Phone Number"
        ]
      },
      {
        "ihs_number": [
          "Ihs Number"
        ]
      },
      {
        "emr_number": [
          "Emr Number"
        ]
      },
      {
        "bpjs_number": [
          "Bpjs Number"
        ]
      },
      {
        "multiple_birth": [
          "Multiple Birth"
        ]
      },
      {
        "linked_patient_id": [
          "Linked Patient Id"
        ]
      },
      {
        "relationship_type": [
          "Relationship Type"
        ]
      },
      {
        "emr": [
          "Emr"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "bpjs_log": [
          "Bpjs Log"
        ]
      },
      {
        "encounter": [
          "Encounter"
        ]
      },
      {
        "invoice": [
          "Invoice"
        ]
      },
      {
        "invoice_claim": [
          "Invoice Claim"
        ]
      },
      {
        "invoice_payment": [
          "Invoice Payment"
        ]
      },
      {
        "patient_queue": [
          "Patient Queue"
        ]
      },
      {
        "patient_room": [
          "Patient Room"
        ]
      },
      {
        "prescriptions": [
          "Prescriptions"
        ]
      },
      {
        "prescriptions_queue": [
          "Prescriptions Queue"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
