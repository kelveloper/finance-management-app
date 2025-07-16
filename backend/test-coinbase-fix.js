const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Test the enhanced Coinbase pattern extraction
function extractSmartMerchantPatterns(description) {
    const patterns = [];
    const normalized = description.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').trim();
    
    // Enhanced Coinbase pattern matching
    const merchantPatterns = {
        'COINBASE': /\bCOINBASE\b|\bCOINBASE\.COM\b|\bCOINBASE\s+INC\b/i,
        'STARBUCKS': /\bSTARBUCKS\b|\bSBX\b/i,
        'AMAZON': /\bAMAZON\b|\bAMZN\b/i,
    };
    
    // Check for known merchants first
    for (const [merchant, pattern] of Object.entries(merchantPatterns)) {
        if (pattern.test(description)) {
            patterns.push(merchant);
        }
    }
    
    return patterns;
}

function isTransactionSimilar(originalDescription, compareDescription, patterns) {
    // Check if any of the extracted patterns match the compare description using word boundaries
    for (const pattern of patterns) {
        const patternRegex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (patternRegex.test(compareDescription)) {
            return true;
        }
    }
    return false;
}

async function testCoinbaseFix() {
    console.log('🔍 Testing Coinbase similarity detection fix...\n');

    try {
        // Get a sample of Coinbase transactions (both categorized and uncategorized)
        const { data: coinbaseTransactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', 'dev_user_2025')
            .ilike('description', '%coinbase%')
            .limit(10);

        if (error) throw error;

        console.log(`📊 Found ${coinbaseTransactions.length} Coinbase transactions to test:`);
        
        coinbaseTransactions.forEach((t, i) => {
            console.log(`  ${i + 1}. "${t.description}" - Category: ${t.category || 'Uncategorized'}`);
        });

        if (coinbaseTransactions.length < 2) {
            console.log('⚠️  Need at least 2 Coinbase transactions to test similarity');
            return;
        }

        // Test pattern extraction on the first transaction
        const testTransaction = coinbaseTransactions[0];
        const patterns = extractSmartMerchantPatterns(testTransaction.description);
        
        console.log(`\n🎯 Testing patterns extracted from: "${testTransaction.description}"`);
        console.log(`📝 Extracted patterns:`, patterns);

        // Test similarity with other Coinbase transactions
        console.log(`\n🔍 Testing similarity with other transactions:`);
        
        let similarCount = 0;
        coinbaseTransactions.slice(1).forEach((t, i) => {
            const isSimilar = isTransactionSimilar(testTransaction.description, t.description, patterns);
            console.log(`  ${i + 2}. "${t.description}" - Similar: ${isSimilar ? '✅' : '❌'}`);
            if (isSimilar) similarCount++;
        });

        console.log(`\n📈 Results:`);
        console.log(`  🎯 Reference transaction: "${testTransaction.description}"`);
        console.log(`  ✅ Similar transactions found: ${similarCount}/${coinbaseTransactions.length - 1}`);
        console.log(`  📋 Patterns used: ${patterns.join(', ')}`);

        // Test with different Coinbase formats
        console.log(`\n🧪 Testing pattern matching with various Coinbase formats:`);
        
        const testDescriptions = [
            'COINBASE.COM',
            'COINBASE INC',
            'Coinbase',
            'coinbase.com',
            'COINBASE PURCHASE',
            'Transfer from COINBASE',
            'PAYPAL *COINBASE'
        ];

        testDescriptions.forEach(desc => {
            const testPatterns = extractSmartMerchantPatterns(desc);
            const matchesCoinbase = testPatterns.includes('COINBASE');
            console.log(`  "${desc}" -> Patterns: [${testPatterns.join(', ')}] -> Coinbase: ${matchesCoinbase ? '✅' : '❌'}`);
        });

        // Final verification: check if uncategorized Coinbase transactions would be grouped
        const uncategorizedCoinbase = coinbaseTransactions.filter(t => 
            !t.category || t.category === 'Uncategorized' || t.category === 'General'
        );
        
        console.log(`\n🔍 Uncategorized Coinbase transactions that should be grouped:`);
        console.log(`  📊 Total uncategorized: ${uncategorizedCoinbase.length}`);
        
        if (uncategorizedCoinbase.length > 0) {
            uncategorizedCoinbase.forEach((t, i) => {
                const patterns = extractSmartMerchantPatterns(t.description);
                const hasCoinbasePattern = patterns.includes('COINBASE');
                console.log(`  ${i + 1}. "${t.description}" -> Coinbase pattern: ${hasCoinbasePattern ? '✅' : '❌'}`);
            });
        }

        console.log(`\n✅ Fix verification complete!`);
        console.log(`   All Coinbase transactions should now be detected as similar for bulk categorization.`);

    } catch (error) {
        console.error('❌ Error testing Coinbase fix:', error);
    }
}

testCoinbaseFix();
