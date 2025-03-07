import type { ModelBase } from "system/model/base";

export const client = {
  "table": "m_client",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "name": {
      "type": "text"
    },
    "satusehat_id": {
      "type": "text"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "config": {
      "type": "json"
    },
    "created_date": {
      "type": "datetime",
      "default": "now()"
    },
    "created_by": {
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
    "invoice_payment": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_payment.id_client"
    },
    "medical_service": {
      "type": "has_many",
      "from": "id",
      "to": "medical_service.id_client"
    },
    "poli": {
      "type": "has_many",
      "from": "id",
      "to": "poli.id_client"
    },
    "medicine": {
      "type": "has_many",
      "from": "id",
      "to": "medicine.id_client"
    },
    "patient": {
      "type": "has_many",
      "from": "id",
      "to": "patient.id_client"
    },
    "staff_role": {
      "type": "has_many",
      "from": "id",
      "to": "staff_role.id_client"
    },
    "role_menu": {
      "type": "has_many",
      "from": "id",
      "to": "role_menu.id_client"
    },
    "menu": {
      "type": "has_many",
      "from": "id",
      "to": "menu.id_client"
    },
    "diagnosis": {
      "type": "has_many",
      "from": "id",
      "to": "diagnosis.id_client"
    },
    "user": {
      "type": "has_many",
      "from": "id",
      "to": "user.id_client"
    },
    "emr_observation": {
      "type": "has_many",
      "from": "id",
      "to": "emr_observation.id_client"
    },
    "encounter": {
      "type": "has_many",
      "from": "id",
      "to": "encounter.id_client"
    },
    "schedule_poli": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_poli.id_client"
    },
    "prescriptions_queue": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions_queue.id_client"
    },
    "bpjs_log": {
      "type": "has_many",
      "from": "id",
      "to": "bpjs_log.id_client"
    },
    "schedule_doctor": {
      "type": "has_many",
      "from": "id",
      "to": "schedule_doctor.id_client"
    },
    "invoice": {
      "type": "has_many",
      "from": "id",
      "to": "invoice.id_client"
    },
    "satusehat_log": {
      "type": "has_many",
      "from": "id",
      "to": "satusehat_log.id_client"
    },
    "emr_anamnesis": {
      "type": "has_many",
      "from": "id",
      "to": "emr_anamnesis.id_client"
    },
    "prescriptions": {
      "type": "has_many",
      "from": "id",
      "to": "prescriptions.id_client"
    },
    "room": {
      "type": "has_many",
      "from": "id",
      "to": "room.id_client"
    },
    "patient_queue": {
      "type": "has_many",
      "from": "id",
      "to": "patient_queue.id_client"
    },
    "emr_service_request": {
      "type": "has_many",
      "from": "id",
      "to": "emr_service_request.id_client"
    },
    "user_menu": {
      "type": "has_many",
      "from": "id",
      "to": "user_menu.id_client"
    },
    "patient_room": {
      "type": "has_many",
      "from": "id",
      "to": "patient_room.id_client"
    },
    "staff_log": {
      "type": "has_many",
      "from": "id",
      "to": "staff_log.id_client"
    },
    "treatment": {
      "type": "has_many",
      "from": "id",
      "to": "treatment.id_client"
    },
    "staff": {
      "type": "has_many",
      "from": "id",
      "to": "staff.id_client"
    },
    "emr_diagnosis_treatment": {
      "type": "has_many",
      "from": "id",
      "to": "emr_diagnosis_treatment.id_client"
    },
    "emr": {
      "type": "has_many",
      "from": "id",
      "to": "emr.id_client"
    },
    "invoice_claim": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_claim.id_client"
    },
    "invoice_line": {
      "type": "has_many",
      "from": "id",
      "to": "invoice_line.id_client"
    }
  }
} as const satisfies ModelBase;
