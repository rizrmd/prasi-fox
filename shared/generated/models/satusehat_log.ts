import type { ModelBase } from "system/model/base";

export const satusehat_log = {
  "table": "t_satusehat_log",
  "columns": {
    "id": {
      "type": "uuid",
      "primary": true
    },
    "endpoint": {
      "type": "text"
    },
    "request_body": {
      "type": "json"
    },
    "response_body": {
      "type": "json"
    },
    "status_code": {
      "type": "number"
    },
    "status": {
      "type": "text"
    },
    "error_message": {
      "type": "text"
    },
    "created_by": {
      "type": "uuid"
    },
    "deleted_at": {
      "type": "datetime"
    },
    "resource_data": {
      "type": "json",
      "default": "{}"
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
    }
  },
  "label": {
    "title": "Satusehat log",
    "record_title": [
      "endpoint",
      "status"
    ],
    "fields": [
      {
        "endpoint": [
          "Endpoint"
        ]
      },
      {
        "request_body": [
          "Request Body"
        ]
      },
      {
        "response_body": [
          "Response Body"
        ]
      },
      {
        "status_code": [
          "Status Code"
        ]
      },
      {
        "status": [
          "Status"
        ]
      },
      {
        "error_message": [
          "Error Message"
        ]
      },
      {
        "resource_data": [
          "Resource Data"
        ]
      },
      {
        "client": [
          "Client"
        ]
      }
    ]
  }
} as const satisfies ModelBase;
