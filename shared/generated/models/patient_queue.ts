import type { ModelBase } from "system/model/base";

export const patient_queue = {
  "table": "t_patient_queue",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "patient_name": {
      "type": "text"
    },
    "queue_number": {
      "type": "text"
    },
    "registered_date": {
      "type": "datetime"
    },
    "patient_phone": {
      "type": "text"
    },
    "channel_name": {
      "type": "text"
    },
    "queue_status": {
      "type": "text"
    },
    "reschedule_date": {
      "type": "datetime"
    },
    "referral_letter_number": {
      "type": "text"
    },
    "referring_physician": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "is_referred": {
      "type": "boolean"
    },
    "reservation_doctor": {
      "type": "text"
    },
    "reservation_poli": {
      "type": "text"
    },
    "reservation_date": {
      "type": "datetime"
    },
    "contact_name": {
      "type": "text"
    },
    "contact_phone": {
      "type": "text"
    },
    "has_bpjs": {
      "type": "boolean",
      "default": "true"
    },
    "bpjs_number": {
      "type": "text"
    },
    "referring_faskes": {
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
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_patient_queue"
    },
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "doctor": {
      "type": "belongs_to",
      "from": "id_doctor",
      "to": "staff.id"
    },
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
    },
    "poli": {
      "type": "belongs_to",
      "from": "id_poli",
      "to": "poli.id"
    }
  },
  "label": {
    "title": "Patient queue",
    "record_title": [
      "patient_name",
      "queue_number"
    ],
    "fields": [
      {
        "patient_name": [
          "Patient Name"
        ]
      },
      {
        "queue_number": [
          "Queue Number"
        ]
      },
      {
        "registered_date": [
          "Registered Date"
        ]
      },
      {
        "patient_phone": [
          "Patient Phone"
        ]
      },
      {
        "channel_name": [
          "Channel Name"
        ]
      },
      {
        "queue_status": [
          "Queue Status"
        ]
      },
      {
        "reschedule_date": [
          "Reschedule Date"
        ]
      },
      {
        "referral_letter_number": [
          "Referral Letter Number"
        ]
      },
      {
        "referring_physician": [
          "Referring Physician"
        ]
      },
      {
        "is_referred": [
          "Is Referred"
        ]
      },
      {
        "reservation_doctor": [
          "Reservation Doctor"
        ]
      },
      {
        "reservation_poli": [
          "Reservation Poli"
        ]
      },
      {
        "reservation_date": [
          "Reservation Date"
        ]
      },
      {
        "contact_name": [
          "Contact Name"
        ]
      },
      {
        "contact_phone": [
          "Contact Phone"
        ]
      },
      {
        "has_bpjs": [
          "Has Bpjs"
        ]
      },
      {
        "bpjs_number": [
          "Bpjs Number"
        ]
      },
      {
        "referring_faskes": [
          "Referring Faskes"
        ]
      },
      {
        "encounter": [
          "Encounter"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "doctor": [
          "Doctor"
        ]
      },
      {
        "patient": [
          "Patient"
        ]
      },
      {
        "poli": [
          "Poli"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
