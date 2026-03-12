# OFTS API Documentation

## 4) How frontend and backend connect

### Login request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "producer@ofts.com",
  "password": "123456",
  "role": "Producer"
}