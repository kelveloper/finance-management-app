# Smart Tagging Feature Documentation

## Overview

The Smart Tagging feature allows users to efficiently tag multiple similar transactions as "Essential" or "Optional" with AI-powered similarity detection and learning capabilities.

## Key Features

### 1. Smart Similarity Detection
- **Description Similarity (40% weight)**: Compares transaction descriptions using word overlap analysis
- **Amount Similarity (25% weight)**: Identifies transactions with similar amounts
- **Category Similarity (20% weight)**: Groups transactions by the same category
- **Date Proximity (15% weight)**: Considers transactions within 30 days as more similar

### 2. Learning from User Corrections
- When you tag one transaction, the AI suggests similar ones
- If you reject the AI's suggestions and only tag the original, the system learns
- Future suggestions become more accurate based on your preferences

### 3. Tag Management View
- Dedicated section to view all tagged transactions
- Filter by Essential, Optional, or All tags
- Shows statistics: count and total amount for each tag type

## How It Works

### Step 1: Trigger Smart Tagging
1. Click "Essential" or "Optional" on any transaction
2. The system analyzes the transaction and finds similar ones
3. A modal appears showing similar transactions with similarity scores

### Step 2: Review and Select
1. Review the suggested similar transactions
2. Each transaction shows:
   - Similarity score (percentage)
   - Similarity reason (e.g., "same category, similar description")
   - Transaction details (description, date, amount)
3. Use "Select All" or individually select/deselect transactions
4. Click "Tag X Transactions" to apply the tag

### Step 3: Learning Process
- If you select all suggestions: AI learns this pattern is correct
- If you deselect some: AI learns to be more conservative
- If you select none: AI learns this transaction type is unique

## API Endpoints

### Find Similar Transactions
```
POST /api/transactions/:id/similar-for-tagging
Body: { "tag": "essential" | "optional", "includeAlreadyTagged": boolean }
```

### Bulk Tag Transactions
```
POST /api/transactions/smart-tag
Body: { "transactionIds": string[], "tag": "essential" | "optional" }
```

## Testing the Feature

### 1. Basic Smart Tagging
1. Start the backend: `cd backend && npm start`
2. Open the app and navigate to transactions
3. Click "Essential" or "Optional" on a transaction
4. Verify the modal appears with similar transactions
5. Select some transactions and confirm

### 2. Learning Behavior
1. Tag a transaction as "Essential"
2. In the modal, deselect some suggestions
3. Confirm to tag only the selected ones
4. Tag another similar transaction
5. Verify the AI learned and shows fewer suggestions

### 3. Tag Management
1. Click "Tag Management" button
2. Verify you can see all tagged transactions
3. Test the filters (All, Essential, Optional)
4. Verify statistics show correct counts and amounts

### 4. Edge Cases
1. **No Similar Transactions**: Tag a unique transaction and verify "No similar transactions found" message
2. **Already Tagged**: Test with transactions that already have tags
3. **Large Amounts**: Test with transactions of varying amounts

## Similarity Algorithm Details

### Text Similarity Calculation
```javascript
function calculateTextSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  return totalWords > 0 ? (commonWords.length / totalWords) * 100 : 0;
}
```

### Amount Similarity Calculation
```javascript
const amountDiff = Math.abs(Math.abs(source.amount) - Math.abs(target.amount));
const amountSimilarity = Math.max(0, 100 - (amountDiff / Math.abs(source.amount)) * 100);
```

### Date Proximity Calculation
```javascript
const daysDiff = Math.abs(sourceDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
const dateSimilarity = Math.max(0, 100 - (daysDiff / 30) * 100);
```

## UI Components

### SmartTaggingModal
- Shows similar transactions with checkboxes
- Displays similarity scores and reasons
- Provides select all/deselect all functionality
- Shows loading state while fetching suggestions

### TagManagementSection
- Displays statistics for Essential and Optional transactions
- Provides filtering by tag type
- Shows list of tagged transactions with details
- Responsive design for mobile and desktop

## Future Enhancements

1. **Advanced Learning**: Store user correction patterns in database
2. **Merchant Recognition**: Use merchant names for better similarity detection
3. **Frequency Analysis**: Consider transaction frequency in similarity scoring
4. **Custom Rules**: Allow users to create custom tagging rules
5. **Batch Operations**: Support for bulk operations on large transaction sets

## Troubleshooting

### Common Issues

1. **No Similar Transactions Found**
   - Check if the transaction is truly unique
   - Verify the similarity threshold (30%) isn't too high
   - Check if all transactions are already tagged

2. **Poor Similarity Suggestions**
   - The AI is still learning from your corrections
   - Continue using the feature to improve suggestions
   - Check transaction descriptions for consistency

3. **Performance Issues**
   - Similarity calculation is done on the backend
   - Large transaction sets may take longer to process
   - Consider implementing caching for frequent queries

### Debug Information
- Backend logs show similarity calculation details
- Frontend console shows API call responses
- Similarity scores and reasons are displayed in the UI 