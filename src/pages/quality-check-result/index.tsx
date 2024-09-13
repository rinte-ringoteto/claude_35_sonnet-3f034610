import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const QualityCheckResult = () => {
  const router = useRouter();
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQualityCheckResult = async () => {
      try {
        const { data, error } = await supabase
          .from('quality_checks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setCheckResult(data);
      } catch (error) {
        console.error('品質チェック結果の取得に失敗しました:', error.message);
        // サンプルデータを設定
        setCheckResult({
          id: 'sample-id',
          project_id: 'sample-project-id',
          type: 'ドキュメント',
          result: {
            score: 85,
            issues: [
              { type: 'エラー', description: 'セクション1.2が不完全です', severity: 'high' },
              { type: '警告', description: 'セクション2.1に誤字があります', severity: 'medium' },
              { type: '提案', description: '図表の追加を検討してください', severity: 'low' },
            ]
          },
          created_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQualityCheckResult();
  }, []);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'medium':
        return <FaInfoCircle className="text-yellow-500" />;
      case 'low':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen h-full bg-gray-100 flex flex-col">
        <Topbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-700">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-gray-100 flex flex-col">
      <Topbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">品質チェック結果</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">チェック結果サマリー</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-gray-600">総合スコア:</span>
            <span className="text-3xl font-bold text-blue-600">{checkResult.result.score}/100</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-600">チェック種類:</span>
            <span className="text-xl font-semibold text-gray-800">{checkResult.type}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">詳細結果リスト</h2>
          {checkResult.result.issues.map((issue, index) => (
            <div key={index} className="border-b border-gray-200 py-4 last:border-b-0">
              <div className="flex items-center mb-2">
                {getSeverityIcon(issue.severity)}
                <span className="ml-2 font-semibold text-gray-700">{issue.type}</span>
              </div>
              <p className="text-gray-600">{issue.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">改善提案</h2>
          <ul className="list-disc list-inside text-gray-600">
            <li>エラーと警告を優先的に修正してください。</li>
            <li>提案事項を検討し、ドキュメントの品質向上に努めてください。</li>
            <li>定期的に品質チェックを実施し、継続的な改善を心がけてください。</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QualityCheckResult;