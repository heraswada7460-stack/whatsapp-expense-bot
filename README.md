# WhatsApp Expense Tracker Bot

WhatsApp पर chat करके daily expenses log करो, aur "report today/week/month" bolke summary पाओ. कोई app download नहीं करना पड़ता — bas WhatsApp पर message भेजो.

## Kaise kaam karta hai

- `"200 auto"` bhejo → bot expense add kar dega category "Travel" ke saath
- `"500 lunch with friends"` → category "Food" ke saath add hoga
- `"report today"` / `"report week"` / `"report month"` → summary aa jayegi
- `"undo"` → last entry delete ho jayegi
- `"help"` → instructions dikhega

## Setup Steps

### 1. WhatsApp Cloud API setup (Meta ki taraf se, free hai)

1. [Meta for Developers](https://developers.facebook.com/) par account banao
2. Ek naya App banao → "Business" type select karo
3. Us app mein "WhatsApp" product add karo
4. Yaha se milega:
   - **Temporary Access Token** (24 hr valid, testing ke liye) — production ke liye permanent token banana padega (System User se)
   - **Phone Number ID**
   - Ek test WhatsApp number bhi milega jisse aap khud test kar sakte ho

### 2. Project setup

```bash
npm install
cp .env.example .env
```

`.env` file khol kar apni values daalo:
```
WHATSAPP_TOKEN=<Meta se mila token>
WHATSAPP_PHONE_NUMBER_ID=<Meta se mila phone number id>
WEBHOOK_VERIFY_TOKEN=<koi bhi random string, khud choose karo>
```

### 3. Server chalao

```bash
npm start
```

Server `localhost:3000` par chalega. Local testing ke liye ise internet par expose karna hoga — [ngrok](https://ngrok.com/) use kar sakte ho:

```bash
ngrok http 3000
```

Isse ek public URL milega (jaise `https://abc123.ngrok.io`).

### 4. Webhook connect karo Meta se

Meta App Dashboard mein → WhatsApp → Configuration → Webhook:
- **Callback URL:** `https://abc123.ngrok.io/webhook`
- **Verify Token:** wahi jo aapne `.env` mein `WEBHOOK_VERIFY_TOKEN` mein daala tha
- "Webhook Fields" mein `messages` ko subscribe karo

Bas — ab jo bhi test number par message bhejega, uska expense log ho jayega.

### 5. Production ke liye

- Server ko kisi hosting par deploy karo (Railway, Render, Fly.io, ya apna VPS) — ngrok sirf testing ke liye hai
- SQLite chhoti scale ke liye theek hai; zyada users ke liye Postgres/MySQL mein migrate karna better hoga (`src/db.js` mein sirf queries change karni hongi)
- Permanent access token banao (temporary wala 24 ghante mein expire ho jata hai)
- Meta App ko "Live" mode mein daalo (App Review ke baad) taaki koi bhi number use kar sake, sirf test numbers nahi

## File Structure

```
src/
  index.js     — Express server + webhook (message receive/reply)
  db.js        — SQLite database (expenses store karna)
  parser.js    — Message se amount + category nikaalna
  report.js    — Daily/weekly/monthly report banana
  whatsapp.js  — WhatsApp ko reply bhejne ka function
```

## Customize karna ho to

- **Categories:** `src/parser.js` mein `CATEGORY_KEYWORDS` object edit karo — apne hisaab se keywords/categories badal sakte ho
- **Report format:** `src/report.js` mein `generateReport()` function edit karo
- **Naye commands:** `src/index.js` mein webhook handler ke andar naya `if` block add karo
