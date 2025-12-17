# Troubleshooting: Blank White Page

## Quick Diagnosis Steps

If you're seeing a blank white page, follow these steps in order:

### Step 1: Check Browser Console (MOST IMPORTANT)

1. Open DevTools: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Click the **Console** tab
3. Look for red error messages

**Common errors and solutions:**

#### Error: "Cannot read property 'XXX' of undefined"
**Cause:** Data initialization issue  
**Solution:** Clear KV storage (see Step 5)

#### Error: "Failed to fetch" or network errors
**Cause:** CSS or module loading issue  
**Solution:** Hard refresh (see Step 2)

#### Error: React rendering errors
**Cause:** Component error  
**Solution:** Check specific component mentioned in error

---

### Step 2: Hard Refresh

Clear browser cache and reload:

**Chrome/Edge:**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- Mac: `Cmd + Option + R`

---

### Step 3: Check Network Tab

1. Open DevTools (`F12`)
2. Click **Network** tab
3. Refresh the page
4. Look for failed requests (red text)

**What to check:**
- ✅ All CSS files loaded (200 status)
- ✅ All JS files loaded (200 status)
- ✅ No 404 errors
- ✅ No CORS errors

---

### Step 4: Verify CSS is Loading

Check if the page has any styling:

1. Right-click on the blank page
2. Select "Inspect Element"
3. Look at the `<body>` element
4. Check if it has background color

**If no background color:**
- CSS failed to load
- Hard refresh (Step 2)
- Check Network tab (Step 3)

**If background color exists but page is blank:**
- React rendering issue
- Check Console for errors (Step 1)

---

### Step 5: Clear KV Storage (Last Resort)

If data is corrupted in the KV store:

1. Open browser console (`F12`)
2. Run these commands:

```javascript
// See what keys exist
await spark.kv.keys()

// Clear all data (WARNING: This deletes everything)
const keys = await spark.kv.keys()
for (const key of keys) {
  await spark.kv.delete(key)
}

// Refresh the page
location.reload()
```

**After clearing:**
- Sample data will reload
- You'll be logged in automatically (login status is stored in KV)

---

### Step 6: Check for JavaScript Disabled

1. In DevTools Console, type: `console.log('JS works')`
2. If nothing appears, JavaScript is disabled

**Enable JavaScript:**
- Chrome: Settings → Privacy and Security → Site Settings → JavaScript
- Firefox: about:config → javascript.enabled → true
- Safari: Preferences → Security → Enable JavaScript

---

### Step 7: Browser Compatibility

**Supported Browsers:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Not supported:**
- ❌ Internet Explorer
- ❌ Old mobile browsers

---

## Specific Error Solutions

### Error: "Uncaught ReferenceError: spark is not defined"

**Cause:** Spark SDK not loaded  
**Solution:**
1. Check that `@github/spark` is installed
2. Verify `import "@github/spark/spark"` in `main.tsx`
3. Hard refresh

---

### Error: "Failed to execute 'insertRule' on 'CSSStyleSheet'"

**Cause:** Tailwind CSS initialization issue  
**Solution:**
1. Clear browser cache
2. Hard refresh
3. If persists, check `main.css` imports are correct

---

### Error: "Cannot find module" or import errors

**Cause:** Build issue or missing dependencies  
**Solution:**
1. If running locally: `npm install`
2. Restart dev server: `npm run dev`
3. Clear Vite cache: `rm -rf node_modules/.vite`

---

### Error: Maximum update depth exceeded

**Cause:** Infinite render loop (rare, none found in audit)  
**Solution:**
1. Check Console for specific component
2. Look for `useEffect` without dependencies
3. Look for state updates during render

---

## Still Having Issues?

### Gather Debug Information

Run this in the browser console and share the output:

```javascript
// Debug info
console.log('=== Debug Info ===')
console.log('User Agent:', navigator.userAgent)
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight)
console.log('Spark available:', typeof spark !== 'undefined')
console.log('React available:', typeof React !== 'undefined')
console.log('KV Keys:', await spark.kv.keys())
console.log('==================')
```

---

## Known Non-Issues

These are **NOT** problems:

✅ **Theme variables defined in multiple files** - This is intentional  
✅ **Login bypassed automatically** - isLoggedIn defaults to true in useKV  
✅ **Sample data appears** - Expected on first load  

---

## Development vs Production

### Development Mode (Spark Editor)

- Error boundary re-throws errors for debugging
- More verbose console logging
- Hot module reloading enabled

### Production Mode (Deployed Spark)

- Error boundary shows user-friendly message
- Errors logged but not thrown
- Optimized bundle

**Note:** If you see detailed React errors in production, you're in development mode.

---

## Emergency Reset

If nothing else works, completely reset the app:

```javascript
// In browser console
// Delete ALL KV data
const keys = await spark.kv.keys()
for (const key of keys) {
  await spark.kv.delete(key)
}

// Clear localStorage
localStorage.clear()

// Clear sessionStorage
sessionStorage.clear()

// Hard refresh
location.reload()
```

This will reset the app to factory defaults with sample data.

---

## Prevention Tips

To avoid blank pages in the future:

1. **Always use functional updates with useKV**
   ```typescript
   // ✅ GOOD
   setQuotes((current) => [...current, newQuote])
   
   // ❌ BAD (can cause data loss)
   setQuotes([...quotes, newQuote])
   ```

2. **Check Console regularly during development**
   - Warnings can become errors later

3. **Test in multiple browsers**
   - Chrome, Firefox, Safari

4. **Clear cache when updating**
   - Hard refresh after major changes

---

## Contact Support

If you've tried everything above and still see a blank page:

1. Gather debug info (see above)
2. Take screenshot of Console errors
3. Note which browser/version
4. Describe what you were doing when it broke

The audit shows **no critical errors**, so the issue is likely:
- Browser cache
- Corrupted KV data
- Network issue
- Browser compatibility

99% of blank page issues are solved by a hard refresh or clearing KV storage.
