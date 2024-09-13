import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import Topbar from '@/components/Topbar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const QualityCheck: React.FC = () => {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleItemSelect = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const startCheck = async () => {
    if (selectedItems.length === 0) {
      alert('チェック対象を選択してください。');
      return;
    }

    setIsChecking(true);
    setProgress(0);

    try {
      const response = await axios.post('/api/quality-check', { items: selectedItems });
      
      // プログレスバーのシミュレーション
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // チェック完了後、結果画面へ遷移
      router.push('/quality-check-result');
    } catch (error) {
      console.error('品質チェックに失敗しました', error);
      alert('品質チェックに失敗しました。もう一度お試しください。');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">品質チェック</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">チェック対象選択</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {['ドキュメント', 'ソースコード'].map(item => (
              <div
                key={item}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedItems.includes(item) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'
                }`}
                onClick={() => handleItemSelect(item)}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedItems.includes(item) ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`}>
                    {selectedItems.includes(item) && <FaCheck className="text-white" />}
                  </div>
                  <span className="text-lg">{item}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={startCheck}
            disabled={isChecking}
            className={`w-full py-3 px-6 text-white rounded-lg transition-colors ${
              isChecking ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isChecking ? '品質チェック中...' : '品質チェック開始'}
          </button>
        </div>
        {isChecking && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">チェック進捗</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    進行中
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <FaSpinner className="animate-spin text-blue-500 text-2xl mr-2" />
              <span className="text-gray-600">品質チェックを実行中です...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityCheck;