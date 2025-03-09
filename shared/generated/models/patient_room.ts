import type { ModelBase } from "system/model/base";

export const patient_room = {
  "table": "t_patient_room",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "patient_name": {
      "type": "text"
    },
    "contact_name": {
      "type": "text"
    },
    "phone_number": {
      "type": "text"
    },
    "admission_date": {
      "type": "datetime"
    },
    "referral_letter_number": {
      "type": "text"
    },
    "referring_physician": {
      "type": "text"
    },
    "room_name": {
      "type": "text"
    },
    "doctor_name": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "admission_reason": {
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
    "room": {
      "type": "belongs_to",
      "from": "id_room",
      "to": "room.id"
    }
  },
  "label": {
    "title": "Patient room",
    "record_title": [
      "patient_name",
      "contact_name"
    ],
    "fields": [
      {
        "patient_name": [
          "Patient Name"
        ]
      },
      {
        "contact_name": [
          "Contact Name"
        ]
      },
      {
        "phone_number": [
          "Phone Number"
        ]
      },
      {
        "admission_date": [
          "Admission Date"
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
        "room_name": [
          "Room Name"
        ]
      },
      {
        "doctor_name": [
          "Doctor Name"
        ]
      },
      {
        "admission_reason": [
          "Admission Reason"
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
        "room": [
          "Room"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
