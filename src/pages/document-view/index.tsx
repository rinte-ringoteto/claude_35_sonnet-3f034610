import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiEdit, FiDownload } from 'react-icons/fi';
import Topbar from '@/components/Topbar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const DocumentView = () => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchDocument = async () => {
      if (id) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('ドキュメントの取得に失敗しました:', error);
          setDocument({
            id: '1',
            project_id: 'sample-project',
            type: '要件定義',
            content: {
              title: 'サンプルドキュメント',
              sections: [
                { heading: '概要', content: 'これはサンプルドキュメントです。' },
                { heading: '要件', content: '主要な要件が記載されます。' },
              ],
            },
            created_at: '2023-05-01T12:00:00Z',
            updated_at: '2023-05-01T12:00:00Z',
          });
        } else {
          setDocument(data);
        }
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleEdit = () => {
    // 編集画面への遷移ロジックを実装
    console.log('編集ボタンがクリックされました');
  };

  const handleDownload = () => {
    // ダウンロード処理を実装
    console.log('ダウンロードボタンがクリックされました');
  };

  if (loading) {
    return <div className="min-h-screen h-full flex items-center justify-center">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{document.content.title}</h1>
            <div className="space-x-4">
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <FiEdit className="mr-2" />
                編集
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <FiDownload className="mr-2" />
                ダウンロード
              </button>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              作成日: {new Date(document.created_at).toLocaleString('ja-JP')}
            </p>
            <p className="text-sm text-gray-600">
              最終更新: {new Date(document.updated_at).toLocaleString('ja-JP')}
            </p>
            <p className="text-sm text-gray-600">タイプ: {document.type}</p>
          </div>
          <div className="prose max-w-none">
            {document.content.sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">{section.heading}</h2>
                <p className="text-gray-600">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;