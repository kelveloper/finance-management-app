# Bank Linking Testing Guide

## Manual Testing Checklist

### 🎯 **Core Upload Functionality**
- [ ] **File Selection Works**
  - Click "Upload Transaction CSV" button
  - File picker opens correctly
  - Can select .csv files
  - Can cancel file selection

- [ ] **Progress Indicators**
  - Progress bar appears during upload
  - Shows "Selecting file..." → "Uploading transactions..." → "Processing and categorizing..." → "Complete!"
  - Percentage increases correctly (0% → 25% → 50% → 75% → 100%)

- [ ] **Successful Upload**
  - Success alert appears with message
  - Access token is set (user proceeds to next screen)
  - UI resets after completion

### 🔍 **Error Handling**
- [ ] **Invalid File Format**
  - Upload a non-CSV file
  - Should show appropriate error message
  - UI should reset properly

- [ ] **Network Errors**
  - Test with backend offline
  - Should show network error message
  - UI should reset properly

- [ ] **Unsupported CSV Format**
  - Upload a CSV that's not from Chase
  - Should show "CSV Format Not Supported" message
  - Should mention Chase CSV requirement

### 📱 **Platform Testing**
- [ ] **Web Platform**
  - Test in browser
  - File picker works
  - Alerts use window.alert
  - Upload process completes

- [ ] **Mobile Platform (iOS/Android)**
  - Test on device/simulator
  - File picker works
  - Alerts use native Alert.alert
  - Upload process completes

### 🎨 **UI/UX Testing**
- [ ] **Visual States**
  - Button shows correct text ("Upload Transaction CSV" → "Processing...")
  - Button is disabled during upload
  - Progress container appears/disappears correctly
  - Colors and styling look correct

- [ ] **Responsive Design**
  - Test on different screen sizes
  - Content stays centered
  - Text is readable on all devices

## Test Files to Use

### ✅ **Valid Chase CSV Example**
Create a test file with these headers:
```csv
Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
DEBIT,12/01/2023,STARBUCKS STORE,4.50,DEBIT,1234.56,
CREDIT,12/01/2023,PAYCHECK,2500.00,CREDIT,3734.56,
```

### ❌ **Invalid CSV Examples**
- Empty file
- File with different headers
- Non-CSV file (.txt, .pdf, etc.)

## Backend Testing

### 🔌 **API Endpoint Testing**
```bash
# Test with curl
curl -X POST http://localhost:8000/api/upload-csv \
  -H "x-user-id: test-user" \
  -F "file=@test-chase.csv"
```

### 📊 **Expected Responses**
- **Success**: `{ "accessToken": "...", "message": "...", "categorization": {...} }`
- **Error**: `{ "error": "Invalid CSV format" }`

## Automated Testing Commands

### 🧪 **Backend Tests**
```bash
cd backend
npm test
```

### 🔍 **Linting**
```bash
npm run lint
```

## Performance Testing

### ⚡ **Upload Speed**
- Test with small files (< 1MB)
- Test with larger files (1-10MB)
- Verify progress updates smoothly

### 🏠 **Memory Usage**
- Monitor memory during upload
- Ensure no memory leaks
- File cleanup after processing

## Security Testing

### 🔒 **Data Handling**
- Verify file is not stored permanently
- Check that sensitive data is processed securely
- Ensure proper error messages don't leak info

## Regression Testing

### 🔄 **Before Each Release**
- [ ] Run through all manual tests
- [ ] Test with actual Chase CSV files
- [ ] Verify on both web and mobile
- [ ] Check error handling still works
- [ ] Performance is acceptable

---

## Quick Testing Script

For rapid testing, you can use this checklist:

1. **Happy Path**: Upload valid Chase CSV → Should succeed
2. **Error Path**: Upload invalid file → Should show error
3. **Cancel Path**: Start upload, cancel → Should handle gracefully
4. **Network Path**: Test with backend offline → Should show network error

---

*Last Updated: [Date]* | *Version: 1.0* | *Tested By: [Name]* 