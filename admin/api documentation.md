# Developer API Documentation

Welcome to the VTU Platform Developer API. This API allows you to integrate our services into your own applications.

## Authentication

All API requests must include your API key in the `x-api-key` header. You can generate your API key from the Admin Dashboard under the **API Management** section.

```http
x-api-key: sk_live_your_api_key_here
```

## Base URL

The base URL for all API requests is:

```
http://localhost:5000/api
```

---

## 1. Fetch Plans & Pricing

Retrieve available data and airtime plans with your custom developer pricing.

### GET `/billpayment/plans`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Developer plans retrieved successfully",
  "data": [
    {
      "id": "65a...",
      "name": "MTN 1GB (SME)",
      "operator": "MTN",
      "operator_code": "mtn",
      "price": 250,
      "type": "data",
      "validity": "30 Days",
      "data_amount": "1GB"
    }
  ]
}
```

---

## 2. Data Purchase

Purchase data bundles for any supported network.

### POST `/billpayment/data`

**Request Body:**

```json
{
  "phone": "08012345678",
  "network": "1",
  "plan": "101",
  "amount": 500,
  "ref": "unique_transaction_reference"
}
```

**Parameters:**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `phone` | string | The recipient's phone number |
| `network` | string | Network ID (1=MTN, 2=Airtel, 3=Glo, 4=9mobile) |
| `plan` | string | The data plan ID |
| `amount` | number | The amount to be charged |
| `ref` | string | (Optional) Your unique transaction reference |

---

## 2. Airtime Purchase

Purchase airtime for any supported network.

### POST `/billpayment/airtime`

**Request Body:**

```json
{
  "phone": "08012345678",
  "network": "1",
  "amount": 100,
  "ref": "unique_transaction_reference"
}
```

---

## 3. Cable TV Subscription

### POST `/billpayment/cable/purchase`

**Request Body:**

```json
{
  "phone": "08012345678",
  "provider": "dstv",
  "plan": "compact",
  "smartCardNumber": "1234567890",
  "amount": 5000
}
```

---

## 4. Electricity Payment

### POST `/billpayment/electricity/purchase`

**Request Body:**

```json
{
  "phone": "08012345678",
  "provider": "ikedc",
  "meterNumber": "1234567890",
  "meterType": "prepaid",
  "amount": 2000
}
```

---

## Response Format

All successful responses will have a `200 OK` status and follow this format:

```json
{
  "success": true,
  "message": "Transaction successful",
  "data": {
    "reference": "VTU-123456789",
    "status": "successful"
  }
}
```

Error responses will have an appropriate HTTP status code (400, 401, 500) and follow this format:

```json
{
  "success": false,
  "message": "Error message description"
}
```
