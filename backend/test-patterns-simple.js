// Test the pattern extraction logic directly
console.log('🔍 Testing Coinbase pattern extraction fix...\n');

// Copy the exact pattern extraction function from index.ts
function extractSmartMerchantPatterns(description) {
    const patterns = [];
    const normalized = description.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').trim();
    
    // Known merchant patterns with their variations (case-insensitive)
    const merchantPatterns = {
        'COINBASE': /\bCOINBASE\b|\bCOINBASE\.COM\b|\bCOINBASE\s+INC\b/i,
        'STARBUCKS': /\bSTARBUCKS\b|\bSBX\b/i,
        'AMAZON': /\bAMAZON\b|\bAMZN\b/i,
    };
    
    // Check for known merchants first (these are high-confidence patterns)
    for (const [merchant, pattern] of Object.entries(merchantPatterns)) {
        if (pattern.test(description)) {
            patterns.push(merchant);
        }
    }
    
    console.log(`🔍 Smart pattern extraction for "${description}":`, patterns);
    return patterns;
}

// Test various Coinbase transaction descriptions
const testDescriptions = [
    'COINBASE.COM',
    'COINBASE INC PURCHASE',
    'Coinbase',
    'coinbase.com',
    'TRANSFER TO COINBASE',
    'PAYPAL *COINBASE',
    'DEBIT CARD PURCHASE COINBASE.COM',
    'ACH DEBIT COINBASE INC',
    'ONLINE PURCHASE COINBASE',
    'Not a coinbase transaction',
    'AMAZON.COM',
    'STARBUCKS STORE'
];

console.log('🧪 Testing pattern extraction on various descriptions:\n');

testDescriptions.forEach((desc, i) => {
    const patterns = extractSmartMerchantPatterns(desc);
    const hasCoinbase = patterns.includes('COINBASE');
    console.log(`${i + 1}. "${desc}"`);
    console.log(`   Patterns: [${patterns.join(', ')}]`);
    console.log(`   Coinbase detected: ${hasCoinbase ? '✅ YES' : '❌ NO'}\n`);
});

// Test similarity function
function isTransactionSimilar(originalDescription, compareDescription, patterns) {
    for (const pattern of patterns) {
        const patternRegex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (patternRegex.test(compareDescription)) {
            return true;
        }
    }
    return false;
}

console.log('🔍 Testing similarity detection:\n');

const referenceTransaction = 'COINBASE.COM PURCHASE';
const referencePatterns = extractSmartMerchantPatterns(referenceTransaction);

console.log(`Reference: "${referenceTransaction}"`);
console.log(`Patterns: [${referencePatterns.join(', ')}]\n`);

const compareTransactions = [
    'COINBASE INC TRANSFER',
    'PAYPAL *COINBASE',
    'DEBIT COINBASE.COM',
    'AMAZON.COM',
    'STARBUCKS'
];

compareTransactions.forEach((desc, i) => {
    const similar = isTransactionSimilar(referenceTransaction, desc, referencePatterns);
    console.log(`${i + 1}. "${desc}" -> Similar: ${similar ? '✅ YES' : '❌ NO'}`);
});

console.log('\n✅ Pattern extraction test complete!');
console.log('   All Coinbase variations should be detected and grouped together.');
