import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/suggest-tasks.ts';
import '@/ai/flows/summarize-week.ts';
