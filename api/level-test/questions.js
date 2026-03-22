// Vercel Serverless Function — GET /api/level-test/questions
// 문제 목록 반환 (정답 제외)

import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

let _cache = null;
function getLocalQuestions() {
  if (_cache) return _cache;
  try {
    const raw = readFileSync(join(process.cwd(), 'server-data', 'level-test-questions.json'), 'utf-8');
    _cache = JSON.parse(raw);
  } catch { _cache = []; }
  return _cache;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let data = [];

    // 1차: Supabase
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/level_test_questions?select=id,level,category,question,options&is_active=eq.true&order=level.asc`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    if (r.ok) data = await r.json();

    // 2차: 서버 파일 폴백
    if (!Array.isArray(data) || data.length < 20) {
      data = getLocalQuestions();
    }

    // 정답 제거
    const sanitized = (data || []).map((q, idx) => {
      const opts = Array.isArray(q.options)
        ? q.options.map(o => typeof o === 'object' ? (o.text || o.label || String(o)) : String(o))
        : [];
      return { id: q.id || `local-${idx}`, level: q.level, category: q.category, question: q.question, options: opts };
    });

    res.json(sanitized);
  } catch (err) {
    console.error('[level-test] questions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
}
