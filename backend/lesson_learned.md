## Lesson Learned: Coinbase Transaction Categorization Issue (July 2025)

### Problem
- Many Coinbase transactions were not being categorized correctly, despite matching the COINBASE pattern.
- 262 out of 933 Coinbase transactions were left uncategorized, even though the pattern matching logic should have caught them.

### Root Cause
- The `smartMatch` function's fuzzy matching logic was too aggressive, causing false positives with unrelated categories (e.g., 'RIDGEWOOD DELI' matching 'WEB' in 'WEB ID').
- The order of category evaluation allowed generic or unrelated categories (like Food & Drink or Income) to match before Financial & Transfers, stopping the correct categorization.

### Solution
- Improved the fuzzy matching logic to be more restrictive:
  - Only match if both pattern and description words are substantial (≥4 characters) and closely related.
  - Require exact word matches, or containment/Levenshtein distance only for longer words.
- Reordered the `ENHANCED_CATEGORY_RULES` so that Financial & Transfers is checked first, ensuring financial patterns are prioritized.
- Verified that all Coinbase transactions are now categorized as 'Financial & Transfers > Cryptocurrency'.

### Impact
- All Coinbase transactions are now correctly categorized.
- The categorization system is more robust and less prone to false positives.
- This approach can be applied to other transaction types to improve overall accuracy.

**Key Takeaway:**
> Always ensure that pattern matching logic is both precise and that category evaluation order prioritizes the most specific/important categories first to avoid false positives and misclassification. 