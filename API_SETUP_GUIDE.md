# API Integration Setup Guide
## Step-by-Step Instructions for External APIs

---

## Overview

This guide walks you through setting up external API integrations for Mint Prints. Follow these steps to connect to supplier APIs and enable product catalog features.

---

## S&S Activewear API Setup

### Step 1: Create S&S Activewear Account

1. Visit [www.ssactivewear.com](https://www.ssactivewear.com)
2. Click "Sign Up" or "Create Account"
3. Complete the registration form
4. Verify your email address
5. Wait for account approval (may take 1-2 business days)

### Step 2: Get API Credentials

1. Log in to your S&S Activewear account
2. Navigate to **Account Settings** or **API Access**
3. Look for **API Credentials** section
4. Copy your:
   - **Account Number** (e.g., `123456`)
   - **API Key** (e.g., `abc123def456...`)

### Step 3: Configure in Mint Prints

1. Open Mint Prints dashboard
2. Click **Settings** in left sidebar (or press `Cmd+7`)
3. Navigate to **API** tab
4. Find **S&S Activewear** section
5. Paste your credentials:
   ```
   Account Number: [Your account number]
   API Key: [Your API key]
   ```
6. Click **Save Credentials**
7. Click **Test Connection** to verify

### Step 4: Verify Integration

1. Go to **Catalog** page (press `Cmd+5`)
2. Select **S&S Activewear** from supplier dropdown
3. Search for a product (e.g., "Gildan 5000")
4. You should see product results with colors and pricing

### Troubleshooting

**Connection Failed:**
- Double-check Account Number and API Key
- Ensure no extra spaces in credentials
- Verify account is approved and active
- Check S&S Activewear API status page

**No Products Found:**
- Try searching by SKU (e.g., "5000" instead of "Gildan 5000")
- Verify your account has product access
- Check that API is enabled in your S&S account settings

**Rate Limit Errors:**
- Wait 1 hour and try again
- Reduce search frequency
- Contact S&S support to increase limits

---

## SanMar API Setup

### Step 1: Create SanMar Account

1. Visit [www.sanmar.com](https://www.sanmar.com)
2. Click "Create Account"
3. Fill in business information
4. Submit credit application
5. Wait for approval (may take several days)

### Step 2: Request API Access

1. Log in to SanMar account
2. Navigate to **Electronic Integration** section
3. Click **API Access Request**
4. Fill out API access form:
   - Business use case
   - Expected API usage
   - Integration timeline
5. Submit and wait for approval

### Step 3: Get API Credentials

Once approved:

1. Log in to SanMar API Portal
2. Navigate to **API Credentials**
3. Generate or view credentials:
   - **Customer ID** (your SanMar customer number)
   - **API Key** (generated key)
4. Save credentials securely

### Step 4: Configure in Mint Prints

1. Open Mint Prints dashboard
2. Go to **Settings** → **API** tab
3. Find **SanMar** section
4. Enter credentials:
   ```
   Customer ID: [Your customer ID]
   API Key: [Your API key]
   ```
5. Click **Save Credentials**
6. Click **Test Connection**

### Step 5: Verify Integration

1. Navigate to **Catalog** page
2. Select **SanMar** from supplier dropdown
3. Search for a product (e.g., "Port Authority polo")
4. Verify results appear with images and pricing

### Troubleshooting

**API Access Denied:**
- Verify API access request was approved
- Check Customer ID matches account
- Ensure API Key is active
- Contact SanMar support

**Invalid Credentials:**
- Double-check Customer ID and API Key
- Regenerate API Key if needed
- Clear browser cache and retry

---

## Twilio SMS Setup (Optional)

### When to Use

Enable SMS notifications for:
- High-priority payment reminders
- Urgent production alerts
- Customer order confirmations

### Step 1: Create Twilio Account

1. Visit [www.twilio.com](https://www.twilio.com)
2. Click "Sign Up"
3. Complete registration
4. Verify email and phone number

### Step 2: Get Trial or Paid Account

**Trial Account** (Limited):
- $15 free credit
- Can only send to verified numbers
- All SMS include "Sent from Twilio trial account" message

**Paid Account** (Recommended):
- Add credit to account ($20+ recommended)
- Send to any number
- No trial message appended

### Step 3: Get Phone Number

1. Log in to Twilio Console
2. Navigate to **Phone Numbers** → **Buy a Number**
3. Select your country
4. Filter by **SMS** capability
5. Choose and purchase a number
6. Note your **From Phone Number** (e.g., `+15551234567`)

### Step 4: Get API Credentials

1. In Twilio Console, go to **Dashboard**
2. Find **Account Info** section
3. Copy:
   - **Account SID** (e.g., `ACxxxxxxxxxxxxxx`)
   - **Auth Token** (click to reveal, then copy)

### Step 5: Configure in Mint Prints

1. Open Mint Prints → **Settings** → **SMS** tab
2. Enter Twilio credentials:
   ```
   Account SID: [Your Account SID]
   Auth Token: [Your Auth Token]
   From Phone Number: [Your Twilio number with country code]
   ```
3. Click **Save Credentials**
4. Click **Test Connection** (sends test SMS to your verified number)

### Step 6: Configure SMS Templates

1. Navigate to **Settings** → **SMS Templates**
2. Customize templates for:
   - Payment reminders
   - Order confirmations
   - Production alerts
3. Test with sample data
4. Save templates

### Step 7: Enable SMS for Customers

1. Go to **Customer Detail** page
2. Find **Payment Reminders** section
3. Toggle **High Priority** to enable SMS
4. Enter customer phone number (with country code)
5. Save

### Compliance & Best Practices

**Before Sending SMS:**
- ✅ Get customer consent for SMS notifications
- ✅ Include opt-out instructions in every message
- ✅ Respect opt-out requests immediately
- ✅ Only send business-related messages
- ✅ Avoid sending late at night or early morning

**Message Limits:**
- Keep under 160 characters when possible (1 segment)
- Each 160 chars = 1 SMS charge
- Include business name and purpose
- Provide contact info or callback number

**Opt-Out Management:**
- Customer replies "STOP" → automatically opt them out
- Track opt-outs in Mint Prints
- Never re-enable without explicit consent

### Troubleshooting

**SMS Not Sending:**
- Verify Account SID and Auth Token
- Check phone number format (+1XXXYYYZZZZ for US)
- Ensure Twilio account has credit
- Verify phone number is SMS-capable
- Check Twilio error logs in console

**Invalid Phone Number:**
- Include country code (+1 for US/Canada)
- Remove spaces, dashes, parentheses
- Format: +15551234567 (not 555-123-4567)

**Trial Account Issues:**
- Add recipient to verified caller list
- Or upgrade to paid account
- Trial accounts can't send to unverified numbers

---

## Testing API Integrations

### Test S&S Activewear

```typescript
// Run in browser console
const testSS = async () => {
  try {
    const product = await ssActivewearAPI.getProductByStyle('5000')
    console.log('✅ S&S Connected:', product?.styleName)
  } catch (error) {
    console.error('❌ S&S Failed:', error.message)
  }
}
testSS()
```

### Test SanMar

```typescript
// Run in browser console
const testSanMar = async () => {
  try {
    const product = await sanMarAPI.getProductByStyle('K500')
    console.log('✅ SanMar Connected:', product?.productName)
  } catch (error) {
    console.error('❌ SanMar Failed:', error.message)
  }
}
testSanMar()
```

### Test Connection Button

All API configuration sections include a **Test Connection** button that:
1. Makes a sample API request
2. Verifies credentials are valid
3. Shows success/error message
4. Logs details to console

---

## API Usage Best Practices

### Caching

Product data changes infrequently. Cache results to reduce API calls:

```typescript
// Products cached for 5 minutes
const cachedProduct = productCache.get(styleID)
if (cachedProduct) {
  return cachedProduct
}

const product = await ssActivewearAPI.getProductByStyle(styleID)
productCache.set(styleID, product, 300000)
```

### Rate Limiting

Avoid hitting rate limits:

**Do:**
- ✅ Debounce search inputs (500ms delay)
- ✅ Cache frequently accessed products
- ✅ Batch requests with delays
- ✅ Use saved favorites instead of repeated searches

**Don't:**
- ❌ Make API calls on every keystroke
- ❌ Fetch same product multiple times
- ❌ Run bulk operations without delays
- ❌ Ignore 429 rate limit errors

### Error Handling

Always handle API errors gracefully:

```typescript
try {
  const product = await ssActivewearAPI.getProductByStyle(sku)
  if (!product) {
    toast.error('Product not found')
    return
  }
  // Use product
} catch (error) {
  if (error.message === 'Invalid API credentials') {
    // Show credentials setup instructions
  } else if (error.message.includes('Rate limit')) {
    // Ask user to try again later
  } else {
    // Generic error message
  }
}
```

---

## Security Reminders

### Credential Storage

- ✅ Credentials stored in encrypted Spark KV store
- ✅ Never logged or exposed in UI
- ✅ Not included in exports or reports
- ✅ Only accessible to app owner

### API Keys

- ❌ Never commit API keys to git
- ❌ Never share keys in screenshots or docs
- ❌ Never email or message keys
- ✅ Regenerate keys if accidentally exposed
- ✅ Store securely in password manager

### Customer Data

- ✅ Customer phone numbers stored encrypted
- ✅ SMS messages comply with regulations
- ✅ Opt-out requests honored immediately
- ✅ Data only accessible within app

---

## Getting Help

### S&S Activewear Support
- **Email**: service@ssactivewear.com
- **Phone**: 1-800-889-0560
- **API Docs**: https://api.ssactivewear.com/V2/Default.aspx

### SanMar Support
- **Email**: customercare@sanmar.com
- **Phone**: 1-800-426-6399
- **API Docs**: https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary

### Twilio Support
- **Support**: https://support.twilio.com
- **Console**: https://console.twilio.com
- **Docs**: https://www.twilio.com/docs/sms

### Mint Prints Documentation
- **API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Quick Reference**: [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**Last Updated**: 2024  
**Version**: 1.0.0
