import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific config
const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;

// Try multiple paths for different execution contexts
const possiblePaths = [
  path.resolve(__dirname, `../${envFile}`),           // For compiled JS from dist/
  path.resolve(__dirname, `../../../${envFile}`),     // For compiled JS from dist/backend/src/
  path.resolve(process.cwd(), envFile),               // For ts-node execution
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (result.parsed && Object.keys(result.parsed).length > 0) {
      envLoaded = true;
      console.log(`📁 Config loaded from: ${envPath}`);
      break;
    }
  } catch (error) {
    // Continue trying other paths
  }
}

if (!envLoaded) {
  console.warn(`⚠️  Could not load ${envFile} from any of these paths:`, possiblePaths);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Supabase credentials missing in ${envFile}`);
}

console.log(`🌍 Environment: ${environment}`);
console.log(`📁 Config file: ${envFile}`);
console.log(`🔗 Supabase URL: ${supabaseUrl}`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 