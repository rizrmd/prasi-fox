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
    "created_date": {
      "type": "datetime"
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
    "patient": {
      "type": "belongs_to",
      "from": "id_patient",
      "to": "patient.id"
    },
    "doctor": {
      "type": "belongs_to",
      "from": "id_doctor",
      "to": "staff.id"
    },
    "emr_observation": {
      "type": "has_many",
      "from": "id",
      "to": "emr_observation.id_emr"
    },
    "emr_anamnesis": {
      "type": "has_many",
      "from": "id",
      "to": "emr_anamnesis.id_emr"
    },
    "prescriptions": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions.id_emr"
    },
    "emr_service_request": {
      "type": "has_many",
      "from": "id",
      "to": "emr_service_request.id_emr"
    },
    "emr_diagnosis_treatment": {
      "type": "has_many",
      "from": "id",
      "to": "emr_diagnosis_treatment.id_emr"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_emr_patient"
    }
  }
} as const satisfies ModelBase;
