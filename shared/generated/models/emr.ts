import type { ModelBase } from "system/model/base";

export const emr = {
  "table": "emr",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "emr_number": {
      "type": "text"
    },
    "patient_name": {
      "type": "text"
    },
    "doctor_name": {
      "type": "text"
    },
    "encounter_type": {
      "type": "text"
    },
    "appointment_date": {
      "type": "datetime"
    },
    "careplan_description": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "id_encounter": {
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
    "emr_anamnesis": {
      "type": "has_many",
      "from": "id",
      "to": "emr_anamnesis.id_emr"
    },
    "emr_diagnosis_treatment": {
      "type": "has_many",
      "from": "id",
      "to": "emr_diagnosis_treatment.id_emr"
    },
    "emr_observation": {
      "type": "has_many",
      "from": "id",
      "to": "emr_observation.id_emr"
    },
    "emr_service_request": {
      "type": "has_many",
      "from": "id",
      "to": "emr_service_request.id_emr"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_emr_patient"
    },
    "prescriptions": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions.id_emr"
    }
  },
  "label": {
    "title": "Emr",
    "record_title": [
      "emr_number",
      "patient_name"
    ],
    "fields": [
      {
        "emr_number": [
          "Emr Number"
        ]
      },
      {
        "patient_name": [
          "Patient Name"
        ]
      },
      {
        "doctor_name": [
          "Doctor Name"
        ]
      },
      {
        "encounter_type": [
          "Encounter Type"
        ]
      },
      {
        "appointment_date": [
          "Appointment Date"
        ]
      },
      {
        "careplan_description": [
          "Careplan Description"
        ]
      },
      {
        "id_encounter": [
          "Id Encounter"
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
        "emr_anamnesis": [
          "Emr Anamnesis"
        ]
      },
      {
        "emr_diagnosis_treatment": [
          "Emr Diagnosis Treatment"
        ]
      },
      {
        "emr_observation": [
          "Emr Observation"
        ]
      },
      {
        "emr_service_request": [
          "Emr Service Request"
        ]
      },
      {
        "encounter": [
          "Encounter"
        ]
      },
      {
        "prescriptions": [
          "Prescriptions"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
