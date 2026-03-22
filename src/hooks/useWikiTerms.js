import { useState, useEffect, useCallback, useRef } from 'react';
import { getWikiTerms } from '../api/wiki';

/**
 * 위키 용어 검색 훅
 * @param {string|null} techniqueId - 현재 페이지 기법 ID (null이면 전체)
 */
export default function useWikiTerms(techniqueId = null) {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const fetchTerms = useCallback(async (q, tid) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWikiTerms({ search: q, techniqueId: tid });
      setTerms(data);
    } catch (e) {
      setError(e.message || '용어를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 검색어 또는 techniqueId 변경 시 debounce 조회
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTerms(search, techniqueId);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, techniqueId, fetchTerms]);

  return { terms, search, setSearch, loading, error, refetch: () => fetchTerms(search, techniqueId) };
}
