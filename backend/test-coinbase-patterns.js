// Test script for Coinbase pattern matching
function extractSmartMerchantPatterns(description) {
    const patterns = [];
    const normalized = description.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').trim();
    
    // Known merchant patterns with their variations (case-insensitive)
    const merchantPatterns = {
        'COINBASE': /\bCOINBASE\b|\bCOINBASE\.COM\b|\bCOINBASE\s+INC\b/i,
        'STARBUCKS': /\bSTARBUCKS\b|\bSBX\b/i,
        // ... other patterns would be here
    };
    
    // Check for known merchants first (these are high-confidence patterns)
    for (const [merchant, pattern] of Object.entries(merchantPatterns)) {
        if (pattern.test(description)) {
            patterns.push(merchant);
        }
    }
    
    return patterns;
}

const testDescriptions = [
  'Coinbase.com     ZUK967JY   ZUK967JY21e6    WEB ID: 1455293997',
  'COINBASE INC.    8889087930 RTL-HXTAXVX6    WEB ID: 1327000623',
  'COINBASE https://www.f CA                    01/10'
];

console.log('Testing extractSmartMerchantPatterns function:');
testDescriptions.forEach(desc => {
  const patterns = extractSmartMerchantPatterns(desc);
  console.log(`Patterns: [${patterns.join(', ')}] - ${desc}`);
});
