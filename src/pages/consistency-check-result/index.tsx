import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FaCheckCircle, FaExclamationTriangle, FaEdit } from 'react-icons/fa';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ConsistencyCheckResult = () => {
  const router = useRouter();
  const [consistencyScore, setConsistencyScore] = useState(0);
  const [inconsistencies, setInconsistencies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchConsistencyData();
  }, []);

  const fetchConsistencyData = async () => {
    try {
      const { data, error } = await supabase
        .from('quality_checks')
        .select('*')
        .eq('type', '整合性')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setConsistencyScore(data.result.score);
        setInconsistencies(data.result.issues);
        setSuggestions(data.result.suggestions || []);
      }
    } catch (error) {
      console.error('整合性データの取得に失敗しました:', error);
      // サンプルデータを表示
      setConsistencyScore(75);
      setInconsistencies([
        { type: '要件定義とシステム設計の不一致', description: '要件定義書に記載されている機能がシステム設計書に反映されていません。', severity: '高' },
        { type: 'テスト計画の不足', description: 'システム設計書に記載されている一部の機能に対するテスト計画が不足しています。', severity: '中' },
      ]);
      setSuggestions([
        '要件定義書とシステム設計書の内容を比較し、不一致を解消してください。',
        'テスト計画書を見直し、すべての機能に対するテスト項目を追加してください。',
      ]);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">整合性確認結果</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">整合性スコア</h2>
          <div className="flex items-center justify-center">
            <div className={`text-6xl font-bold ${consistencyScore >= 80 ? 'text-green-500' : consistencyScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
              {consistencyScore}
            </div>
            <div className="text-2xl ml-2">/ 100</div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">不整合箇所リスト</h2>
          {inconsistencies.map((item, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <FaExclamationTriangle className={`mr-2 ${item.severity === '高' ? 'text-red-500' : 'text-yellow-500'}`} />
                <h3 className="text-lg font-semibold">{item.type}</h3>
              </div>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-sm text-gray-500 mt-2">重要度: {item.severity}</p>
            </div>
          ))}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">修正提案</h2>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg flex items-start">
              <FaEdit className="text-blue-500 mr-3 mt-1" />
              <p>{suggestion}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyCheckResult;