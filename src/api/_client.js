/**
 * 🔄 API 단일 교체 포인트
 *
 * Phase 0 (현재): Supabase 클라이언트를 그대로 재export
 * Phase 1 전환 시: 이 파일의 client를 axios/fetch 기반 NestJS 클라이언트로 교체
 *                  → 나머지 api/*.js 파일들은 수정 불필요
 *
 * 교체 예시 (Phase 1):
 *   import axios from 'axios';
 *   export const client = axios.create({ baseURL: process.env.VITE_API_URL });
 */
import { supabase } from '../lib/supabase';

export const client = supabase;
