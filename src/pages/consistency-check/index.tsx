import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const ConsistencyCheck = () => {
  const router = useRouter();
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [checkProgress, setCheckProgress] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, type, content')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data);
    } catch (error) {
      console.error('ドキュメントの取得に失敗しました:', error.message);
      // サンプルデータを表示
      setDocuments([
        { id: 1, type: '要件定義', content: { title: '要件定義書1' } },
        { id: 2, type: 'システム設計', content: { title: '設計書1' } },
        { id: 3, type: '開発', content: { title: '開発ドキュメント1' } },
      ]);
    }
  };

  const handleDocumentSelect = (documentId) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  const startConsistencyCheck = async () => {
    if (selectedDocuments.length === 0) {
      alert('チェック対象のドキュメントを選択してください。');
      return;
    }

    setIsChecking(true);
    setCheckProgress(0);

    try {
      const response = await axios.post('/api/consistency-check', {
        documentIds: selectedDocuments,
      });

      // 進捗シミュレーション
      for (let i = 0; i <= 100; i += 10) {
        setCheckProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setIsChecking(false);
      router.push('/consistency-check-result');
    } catch (error) {
      console.error('整合性チェックに失敗しました:', error);
      setIsChecking(false);
      alert('整合性チェックに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">整合性確認画面</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">チェック対象選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedDocuments.includes(doc.id)
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => handleDocumentSelect(doc.id)}
              >
                <h3 className="font-medium text-gray-800">{doc.content.title}</h3>
                <p className="text-sm text-gray-600">{doc.type}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startConsistencyCheck}
          disabled={isChecking}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
            isChecking
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isChecking ? 'チェック中...' : 'チェック開始'}
        </button>

        {isChecking && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">チェック進捗</h2>
            <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500 ease-out flex items-center justify-center text-white text-sm"
                style={{ width: `${checkProgress}%` }}
              >
                {checkProgress}%
              </div>
            </div>
            <p className="mt-2 text-gray-600 flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              整合性チェック実行中...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsistencyCheck;