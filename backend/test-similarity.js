// Test similarity between different Coinbase transaction formats
function extractSmartMerchantPatterns(description) {
    const patterns = [];
    
    // Known merchant patterns with their variations (case-insensitive)
    const merchantPatterns = {
        'COINBASE': /\bCOINBASE\b|\bCOINBASE\.COM\b|\bCOINBASE\s+INC\b/i,
    };
    
    // Check for known merchants first
    for (const [merchant, pattern] of Object.entries(merchantPatterns)) {
        if (pattern.test(description)) {
            patterns.push(merchant);
        }
    }
    
    return patterns;
}

function extractMerchantName(description) {
    const merchantPatterns = {
        'COINBASE': /\bCOINBASE\b|\bCOINBASE\.COM\b|\bCOINBASE\s+INC\b/i,
    };
    
    for (const [merchant, pattern] of Object.entries(merchantPatterns)) {
        if (pattern.test(description)) {
            return merchant;
        }
    }
    return null;
}

function isTransactionSimilar(originalDescription, compareDescription, patterns) {
    // Extract merchant names for both descriptions
    const originalMerchant = extractMerchantName(originalDescription);
    const compareMerchant = extractMerchantName(compareDescription);
    
    // If merchant names are the same, they're similar (high confidence)
    if (originalMerchant && compareMerchant && originalMerchant === compareMerchant) {
        return true;
    }
    
    // Check if any of the extracted patterns match the compare description
    for (const pattern of patterns) {
        const patternRegex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (patternRegex.test(compareDescription)) {
            return true;
        }
    }
    
    return false;
}

// Test cases
const testCases = [
    {
        original: 'Coinbase.com     ZUK967JY   ZUK967JY21e6    WEB ID: 1455293997',
        compare: 'COINBASE INC.    8889087930 RTL-HXTAXVX6    WEB ID: 1327000623'
    },
    {
        original: 'Coinbase.com     ZUK967JY   ZUK967JY21e6    WEB ID: 1455293997',
        compare: 'COINBASE https://www.f CA                    01/10'
    },
    {
        original: 'COINBASE INC.    8889087930 RTL-HXTAXVX6    WEB ID: 1327000623',
        compare: 'Coinbase.com     ZUK967JY   ZUK967JY21e6    WEB ID: 1455293997'
    }
];

console.log('Testing similarity between different Coinbase transaction formats:');
testCases.forEach((testCase, index) => {
    const patterns = extractSmartMerchantPatterns(testCase.original);
    const isSimilar = isTransactionSimilar(testCase.original, testCase.compare, patterns);
    
    console.log(`\nTest ${index + 1}:`);
    console.log(`Original: ${testCase.original}`);
    console.log(`Compare:  ${testCase.compare}`);
    console.log(`Patterns: [${patterns.join(', ')}]`);
    console.log(`Similar:  ${isSimilar}`);
});
