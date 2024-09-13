import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { createClient } from '@supabase/supabase-js';
import { FiEdit, FiDownload } from 'react-icons/fi';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ProposalView = () => {
  const router = useRouter();
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    const fetchProposal = async () => {
      // 実際のデータ取得処理をここに実装
      // 仮のデータを設定
      setProposal({
        title: '新規事業提案書',
        content: '提案内容のプレビューがここに表示されます。',
      });
    };

    fetchProposal();
  }, []);

  const handleEdit = () => {
    // 編集画面への遷移処理
    router.push('/proposal-edit');
  };

  const handleExport = () => {
    // エクスポート処理
    alert('提案資料をエクスポートしました。');
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">提案資料表示画面</h1>
        {proposal ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">{proposal.title}</h2>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p>{proposal.content}</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <FiEdit className="mr-2" />
                編集
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <FiDownload className="mr-2" />
                エクスポート
              </button>
            </div>
          </div>
        ) : (
          <p>提案資料を読み込んでいます...</p>
        )}
      </div>
    </div>
  );
};

export default ProposalView;