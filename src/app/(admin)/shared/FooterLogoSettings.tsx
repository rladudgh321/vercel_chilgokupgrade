'use client';

import { useState, useEffect, useCallback } from 'react';

type DisplayStyle = 'both' | 'logo_only' | 'brand_only';

const FooterLogoSettings = () => {
  const [originalLogoName, setOriginalLogoName] = useState<string>('');
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('both');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/logo');
      const result = await response.json();
      if (result.ok && result.data) {
        const fullLogoName = result.data.logoName || '';
        const [name, style] = fullLogoName.split('#');
        setOriginalLogoName(name);
        setDisplayStyle((style as DisplayStyle) || 'both');
      }
    } catch (e) {
      setError('데이터를 불러오는 데 실패했습니다.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const newLogoName = `${originalLogoName}#${displayStyle}`;
      const response = await fetch('/api/admin/settings/logo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoName: newLogoName }),
      });

      if (!response.ok) {
        throw new Error('설정 저장에 실패했습니다.');
      }
      alert('설정이 저장되었습니다.');
    } catch (e: any) {
      setError(e.message || '설정 저장 중 오류가 발생했습니다.');
    }
    setSaving(false);
  };

  if (loading) return <p>푸터 로고 설정 로딩 중...</p>;

  return (
    <div className="p-4 border rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">푸터 로고/브랜드명 표시 설정</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="space-y-2 mb-4">
        <div>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="displayStyle"
              value="both"
              checked={displayStyle === 'both'}
              onChange={() => setDisplayStyle('both')}
              className="form-radio"
            />
            <span className="ml-2">로고 + 브랜드명</span>
          </label>
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="displayStyle"
              value="logo_only"
              checked={displayStyle === 'logo_only'}
              onChange={() => setDisplayStyle('logo_only')}
              className="form-radio"
            />
            <span className="ml-2">로고만</span>
          </label>
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="displayStyle"
              value="brand_only"
              checked={displayStyle === 'brand_only'}
              onChange={() => setDisplayStyle('brand_only')}
              className="form-radio"
            />
            <span className="ml-2">브랜드명만</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {saving ? '저장 중...' : '설정 저장'}
      </button>
    </div>
  );
};

export default FooterLogoSettings;
