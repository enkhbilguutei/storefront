# QPay Payment Module

QPay хэрэглэгчийн модуль нь Монголын хамгийн түгээмэл төлбөрийн хэрэгсэл болох QPay-тэй холбогдон ажиллах боломжийг олгоно.

## Онцлог

- ✅ QR код үүсгэх
- ✅ Банкны апп-ийн холбоосууд
- ✅ Төлбөр шалгах (Callback болон Poll)
- ✅ Sandbox болон Production горим

## Тохиргоо

### Environment Variables

Backend-ийн `.env` файлд дараах хувьсагчдыг нэмнэ үү:

```env
QPAY_CLIENT_ID=your_client_id
QPAY_CLIENT_SECRET=your_client_secret
QPAY_INVOICE_CODE=your_invoice_code
QPAY_CALLBACK_URL=https://api.yourdomain.mn/store/qpay/callback
QPAY_SANDBOX=true
```

### medusa-config.ts

Модуль автоматаар бүртгэгдсэн байгаа:

```typescript
{
  resolve: "./src/modules/qpay",
  options: {
    clientId: process.env.QPAY_CLIENT_ID,
    clientSecret: process.env.QPAY_CLIENT_SECRET,
    invoiceCode: process.env.QPAY_INVOICE_CODE,
    callbackUrl: process.env.QPAY_CALLBACK_URL,
    isSandbox: process.env.QPAY_SANDBOX !== "false",
  },
},
```

## API Endpoints

### GET /store/qpay

QPay тохиргоо шалгах

**Response:**
```json
{
  "available": true,
  "sandbox_mode": true
}
```

### POST /store/qpay/create-invoice

Нэхэмжлэл үүсгэх

**Request:**
```json
{
  "order_id": "order_123",
  "amount": 50000,
  "description": "Захиалга #123",
  "customer_name": "Бат",
  "customer_email": "bat@example.com",
  "customer_phone": "99001234"
}
```

**Response:**
```json
{
  "success": true,
  "invoice": {
    "invoice_id": "abc123",
    "qr_text": "...",
    "qr_image": "data:image/png;base64,...",
    "short_url": "https://qpay.mn/s/abc123",
    "urls": [
      {
        "name": "Khan Bank",
        "description": "Хаан банк апп",
        "logo": "https://...",
        "link": "khanbank://..."
      }
    ]
  }
}
```

### GET /store/qpay/check-payment/:payment_id

Төлбөр шалгах

**Response:**
```json
{
  "success": true,
  "payment": {
    "payment_id": "abc123",
    "status": "PAID",
    "amount": 50000,
    "fee": 0,
    "currency": "MNT",
    "date": "2024-01-15T10:30:00Z",
    "transaction_type": "P2P"
  }
}
```

### POST /store/qpay/callback

QPay-ээс callback хүлээн авах (QPay дуудна)

### GET /store/qpay/callback

Хэрэглэгчийг буцаан чиглүүлэх

## Төлбөрийн статус

| Статус | Тайлбар |
|--------|---------|
| `NEW` | Нэхэмжлэл үүссэн |
| `PAID` | Төлөгдсөн |
| `PARTIAL` | Дутуу төлөгдсөн |
| `FAILED` | Амжилтгүй |
| `REFUNDED` | Буцаагдсан |

## Хөгжүүлэлт

### Sandbox Credentials

QPay sandbox credentials авахын тулд:

1. https://merchant-sandbox.qpay.mn бүртгүүлэх
2. Merchant dashboard-аас credentials авах
3. `.env` файлд нэмэх

### Testing

Sandbox горимд тест төлбөр хийхдээ QPay sandbox app ашиглана:

1. QPay Sandbox app татах (iOS/Android)
2. Test account-аар нэвтрэх
3. QR код уншуулж төлбөр хийх

## Storefront интеграц

Storefront-д QPay payment сонголт автоматаар харагдана (хэрэв backend-д тохиргоо хийгдсэн бол).

`PaymentStep.tsx` компонент нь QPay-ийн боломжтой эсэхийг шалгаж, харуулна.

## Troubleshooting

### QPay not available

- Environment variables шалгах
- Backend дахин эхлүүлэх
- `/store/qpay` endpoint шалгах

### Callback not receiving

- `QPAY_CALLBACK_URL` зөв public URL байх ёстой
- CORS тохиргоо шалгах
- QPay merchant dashboard-аас webhook тохируулах

### Invoice creation failing

- `QPAY_INVOICE_CODE` зөв эсэх шалгах
- Sandbox/Production горим тохирч байгаа эсэх
- Token refresh асуудал - backend дахин эхлүүлэх
