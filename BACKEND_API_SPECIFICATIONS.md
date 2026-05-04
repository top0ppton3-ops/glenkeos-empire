# BACKEND API SPECIFICATIONS

## Payment API

### PayPal
- **Endpoint**: `/api/v1/paypal/pay`
- **Method**: POST
- **Request Schema**:
  ```json
  {
    "amount": "number",
    "currency": "string",
    "description": "string",
    "payment_method_nonce": "string"
  }
  ```
- **Response Schema**:
  ```json
  {
    "status": "string",
    "transaction_id": "string",
    "message": "string"
  }
  ```
- **Error Handling**:
  - 400: Invalid request
  - 401: Unauthorized
- **Authentication**: Bearer token required.

### Stripe
- **Endpoint**: `/api/v1/stripe/charge`
- **Method**: POST
- **Request Schema**:
  ```json
  {
    "amount": "number",
    "currency": "string",
    "source": "string",
    "description": "string"
  }
  ```
- **Response Schema**:
  ```json
  {
    "status": "string",
    "transaction_id": "string",
    "message": "string"
  }
  ```
- **Error Handling**:
  - 400: Invalid request
  - 402: Payment required
- **Authentication**: Bearer token required.

## Notification API

### Email
- **Endpoint**: `/api/v1/notifications/email`
- **Method**: POST
- **Request Schema**:
  ```json
  {
    "to": "string",
    "subject": "string",
    "body": "string"
  }
  ```
- **Response Schema**:
  ```json
  {
    "status": "string",
    "message": "string"
  }
  ```
- **Error Handling**:
  - 400: Invalid request
- **Authentication**: Bearer token required.

### SMS
- **Endpoint**: `/api/v1/notifications/sms`
- **Method**: POST
- **Request Schema**:
  ```json
  {
    "to": "string",
    "message": "string"
  }
  ```
- **Response Schema**:
  ```json
  {
    "status": "string",
    "message": "string"
  }
  ```
- **Error Handling**:
  - 400: Invalid request
- **Authentication**: Bearer token required.

### Push
- **Endpoint**: `/api/v1/notifications/push`
- **Method**: POST
- **Request Schema**:
  ```json
  {
    "user_id": "string",
    "message": "string"
  }
  ```
- **Response Schema**:
  ```json
  {
    "status": "string",
    "message": "string"
  }
  ```
- **Error Handling**:
  - 400: Invalid request
- **Authentication**: Bearer token required.

## Tracking API

### Driver location
- **Endpoint**: `/api/v1/tracking/driver`
- **Method**: GET
- **Response Schema**:
  ```json
  {
    "latitude": "number",
    "longitude": "number",
    "status": "string"
  }
  ```
- **Error Handling**:
  - 404: Driver not found
- **Authentication**: Bearer token required.

### Order Status
- **Endpoint**: `/api/v1/tracking/order/{order_id}`
- **Method**: GET
- **Response Schema**:
  ```json
  {
    "order_id": "string",
    "status": "string",
    "estimated_delivery": "string"
  }
  ```
- **Error Handling**:
  - 404: Order not found
- **Authentication**: Bearer token required.

## Loyalty API

### Points
- **Endpoint**: `/api/v1/loyalty/points`
- **Method**: GET
- **Response Schema**:
  ```json
  {
    "user_id": "string",
    "points": "number"
  }
  ```
- **Error Handling**:
  - 404: User not found
- **Authentication**: Bearer token required.

### Redemption
- **Endpoint**: `/api/v1/loyalty/redeem`
- **Method**: POST
- **Request Schema**:
  ```json
  {
    "user_id": "string",
    "points": "number"
  }
  ```
- **Response Schema**:
  ```json
  {
    "status": "string",
    "message": "string"
  }
  ```
- **Error Handling**:
  - 400: Invalid request
  - 404: User not found
- **Authentication**: Bearer token required.

## Support API

### Ticketing
- **Endpoint**: `/api/v1/support/tickets`
- **Method**: POST
- **Request Schema**:
  ```json
  {
    "user_id": "string",
    "issue": "string",
    "description": "string"
  }
  ```
- **Response Schema**:
  ```json
  {
    "status": "string",
    "ticket_id": "string",
    "message": "string"
  }
  ```
- **Error Handling**:
  - 400: Invalid request
- **Authentication**: Bearer token required.