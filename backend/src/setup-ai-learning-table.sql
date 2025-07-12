-- AI Learning Patterns Table
-- Stores learned categorization patterns WITHOUT personal information

CREATE TABLE IF NOT EXISTS ai_learned_patterns (
    id SERIAL PRIMARY KEY,
    pattern TEXT NOT NULL,           -- Generic business pattern (e.g., "DIRECT DEP", "STARBUCKS")
    category TEXT NOT NULL,          -- Main category (e.g., "Income", "Food & Drink")
    subcategory TEXT NOT NULL,       -- Subcategory (e.g., "Salary", "Coffee & Tea")
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.60,  -- Confidence level (0.0 to 1.0)
    occurrences INTEGER NOT NULL DEFAULT 1,         -- How many times this pattern was confirmed
    last_seen TIMESTAMP DEFAULT NOW(),              -- When this pattern was last seen
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure unique combinations of pattern + category + subcategory
    UNIQUE(pattern, category, subcategory)
);

-- Index for fast pattern lookups
CREATE INDEX IF NOT EXISTS idx_ai_patterns_lookup ON ai_learned_patterns(pattern, confidence);

-- Index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_ai_patterns_confidence ON ai_learned_patterns(confidence, last_seen);

-- Add comments for clarity
COMMENT ON TABLE ai_learned_patterns IS 'AI learned categorization patterns (privacy-focused - no personal data)';
COMMENT ON COLUMN ai_learned_patterns.pattern IS 'Generic business pattern extracted from transactions';
COMMENT ON COLUMN ai_learned_patterns.confidence IS 'How confident the AI is in this pattern (0.0 to 1.0)';
COMMENT ON COLUMN ai_learned_patterns.occurrences IS 'Number of times users confirmed this pattern';

-- Sample data for testing (generic patterns only)
INSERT INTO ai_learned_patterns (pattern, category, subcategory, confidence, occurrences) VALUES
('DIRECT DEP', 'Income', 'Salary', 0.95, 5),
('STARBUCKS', 'Food & Drink', 'Coffee & Tea', 0.90, 8),
('MCDONALD', 'Food & Drink', 'Fast Food', 0.90, 6),
('COINBASE', 'Financial & Transfers', 'Cryptocurrency', 0.85, 12),
('UBER', 'Transportation', 'Rideshare', 0.90, 4),
('PAYPAL', 'Financial & Transfers', 'Digital Payments', 0.85, 3)
ON CONFLICT (pattern, category, subcategory) DO NOTHING; 