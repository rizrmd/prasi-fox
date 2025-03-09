import type { ModelBase } from "system/model/base";

export const staff = {
  "table": "m_staff",
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
    "ihs_number": {
      "type": "text"
    },
    "phone_number": {
      "type": "text"
    },
    "speciality": {
      "type": "text"
    },
    "certified": {
      "type": "text"
    },
    "issuer": {
      "type": "text"
    },
    "start_date": {
      "type": "datetime"
    },
    "end_date": {
      "type": "datetime"
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
    "status": {
      "type": "text",
      "default": "Available"
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
      "to": "emr.id_doctor"
    },
    "schedule_doctor": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_doctor.id_staff"
    },
    "schedule_poli": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_poli.id_staff"
    },
    "client": {
      "type": "belongs_to",
      "from": "id_client",
      "to": "client.id"
    },
    "staff_role": {
      "type": "belongs_to",
      "from": "id_staff_role",
      "to": "staff_role.id"
    },
    "user": {
      "type": "has_many",
      "from": "id",
      "to": "user.id_staff"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_staff"
    },
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_staff"
    },
    "patient_queue": {
      "type": "has_many",
      "from": "id",
      "to": "patient_queue.id_doctor"
    },
    "patient_room": {
      "type": "has_many",
      "from": "id",
      "to": "patient_room.id_doctor"
    },
    "prescriptions": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions.id_staff"
    },
    "prescriptions_queue": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions_queue.id_staff"
    },
    "staff_log": {
      "type": "has_many",
      "from": "id",
      "to": "staff_log.id_staff"
    }
  },
  "label": {
    "title": "Staff",
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
        "ihs_number": [
          "Ihs Number"
        ]
      },
      {
        "phone_number": [
          "Phone Number"
        ]
      },
      {
        "speciality": [
          "Speciality"
        ]
      },
      {
        "certified": [
          "Certified"
        ]
      },
      {
        "issuer": [
          "Issuer"
        ]
      },
      {
        "start_date": [
          "Start Date"
        ]
      },
      {
        "end_date": [
          "End Date"
        ]
      },
      {
        "status": [
          "Status"
        ]
      },
      {
        "emr": [
          "Emr"
        ]
      },
      {
        "schedule_doctor": [
          "Schedule Doctor"
        ]
      },
      {
        "schedule_poli": [
          "Schedule Poli"
        ]
      },
      {
        "client": [
          "Client"
        ]
      },
      {
        "staff_role": [
          "Staff Role"
        ]
      },
      {
        "user": [
          "User"
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
      },
      {
        "staff_log": [
          "Staff Log"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
