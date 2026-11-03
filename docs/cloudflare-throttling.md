# Cloudflare Throttling & Spam Mitigation Guide for CANFACS

This guide outlines how to prevent spam bots from flooding the **"New Member Application Received"** workflow by combining **Application-level Spam Detection** with **Cloudflare Edge Throttling & WAF Protection**.

---

## 1. Cloudflare Edge WAF Rate Limiting (Recommended Setup)

Cloudflare Rate Limiting rules run at Cloudflare’s global edge network, stopping spam loops **before** they consume Worker compute or touch your database.

### Step-by-Step Dashboard Setup:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select the `canfacs.org` zone.
3. In the left navigation, go to **Security** → **WAF** → **Rate limiting rules**.
4. Click **Create rule**.
5. Configure the rule with the following settings:
   - **Rule name**: `Throttle Membership Application Spammers`
   - **If incoming requests match...**:
     - Field: `URI Path` | Operator: `equals` | Value: `/join-canfacs`
     - AND
     - Field: `Request Method` | Operator: `equals` | Value: `POST`
     - _(Expression Preview)_: `(http.request.method eq "POST" and http.request.uri.path eq "/join-canfacs")`
   - **Rate limiting criteria**:
     - Characteristic: **IP address** (`ip.src`)
     - Requests: `5` requests
     - Period: `10 minutes` (or `1 minute` for aggressive protection)
   - **Choose action**:
     - Action: **Block** (or **Managed Challenge** to verify legitimate users with Cloudflare Turnstile)
     - Response code: `429 (Too Many Requests)`
     - Duration / Mitigation timeout: `1 hour` (or `10 minutes`)
6. Click **Deploy**.

---

## 2. Cloudflare WAF Custom Rule for HTML / Script Payloads

Block known spam payloads containing HTML tags and script injections at Cloudflare's edge:

1. In Cloudflare, go to **Security** → **WAF** → **Custom rules**.
2. Click **Create rule**.
3. **Rule name**: `Block HTML and Script Injection on Registration`
4. Set rule expression:
   ```
   (http.request.method eq "POST" and http.request.uri.path eq "/join-canfacs" and (
     http.request.body.raw contains "<script" or
     http.request.body.raw contains "javascript:" or
     http.request.body.raw contains "<a " or
     http.request.body.raw contains "<iframe" or
     http.request.body.raw contains "onerror=" or
     http.request.body.raw contains "onload=" or
     http.request.body.raw contains "document.cookie"
   ))
   ```
5. **Action**: **Block**
6. Click **Deploy**.

---

## 3. Cloudflare Bot Fight Mode

Turn on Cloudflare's automated bot protection:

1. In Cloudflare, go to **Security** → **Bots**.
2. Enable **Bot Fight Mode** (available on free and Pro tiers).
3. This automatically challenges automated headless browsers and scraping tools trying to access public forms.

---

## 4. Application-Level Multi-Layer Defense (Implemented in Code)

Even if traffic bypasses edge filters, our application code provides the following defenses:

1. **Native Cloudflare Worker Rate Limiter**:
   - Defined in `wrangler.jsonc` under `"ratelimits"` with name `REGISTRATION_RATE_LIMITER`.
   - Evaluates `platform.env.REGISTRATION_RATE_LIMITER.limit({ key: clientIp })`.
   - Automatically returns HTTP 429 when an IP loops requests.

2. **In-Memory Sliding-Window Fallback Rate Limiter**:
   - Tracks client IPs via `CF-Connecting-IP` / `X-Forwarded-For`.
   - Caps submissions to max 5 requests per 10-minute sliding window per IP.

3. **HTML & JavaScript Injection Sanitizer & Filter** (`src/lib/server/spamFilter.ts`):
   - Detects `<script>`, `<iframe>`, `<a>`, `<img onerror=...>`, `<b>`, `<div>`, etc.
   - Detects `javascript:`, inline event handlers (`onload=`, `onerror=`), `eval()`, `alert()`, `document.cookie`.
   - Detects BBCode `[url=...]` and promotional URLs in name, profession, city, or bio.
   - When detected, the application **immediately rejects** with HTTP 400.
   - **Crucially: No member is created in D1, and NO notification email is dispatched.**

4. **Invisible Honeypot Trap**:
   - An invisible field `contact_preferred_website` hidden from human users via CSS and screen-reader attributes.
   - Automated bots scrape the DOM and fill all input fields.
   - Any submission with a populated honeypot is immediately blocked without triggering emails.

5. **Anti-Bot Submission Timing**:
   - Validates that form completion took longer than 2 seconds using a server timestamp token.
   - Rapid-fire 50ms bot submissions are rejected.
