import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FaFileAlt, FaPlay, FaSpinner } from 'react-icons/fa';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const DocumentGeneration = () => {
  const router = useRouter();
  const [documentType, setDocumentType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocumentType(e.target.value);
  };

  const handleGenerateDocument = async () => {
    if (!documentType) {
      alert('ドキュメントの種類を選択してください。');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // ここでバックエンドAPIを呼び出し、ドキュメント生成を開始します
      // 実際のAPIエンドポイントに置き換えてください
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType }),
      });

      if (!response.ok) {
        throw new Error('ドキュメント生成に失敗しました');
      }

      // 進捗をシミュレートします
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 500);

      // 生成完了を待ちます
      await new Promise(resolve => setTimeout(resolve, 5000));

      clearInterval(interval);
      setProgress(100);

      // 生成完了後、ドキュメント表示画面へ遷移します
      router.push('/document-display');
    } catch (error) {
      console.error('Error generating document:', error);
      alert('ドキュメント生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">ドキュメント生成</h1>
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
          <div className="mb-6">
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
              生成するドキュメントの種類
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={handleDocumentTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">選択してください</option>
              <option value="requirements">要件定義書</option>
              <option value="design">設計書</option>
              <option value="test">テスト仕様書</option>
            </select>
          </div>
          <button
            onClick={handleGenerateDocument}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white ${
              isGenerating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isGenerating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                生成中...
              </>
            ) : (
              <>
                <FaPlay className="mr-2" />
                生成開始
              </>
            )}
          </button>
          {isGenerating && (
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      生成進捗
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentGeneration;