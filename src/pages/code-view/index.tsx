import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiEdit, FiDownload } from 'react-icons/fi';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const CodeView = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const fetchCode = async () => {
      const { data, error } = await supabase
        .from('source_codes')
        .select('content, file_name')
        .single();

      if (error) {
        console.error('Error fetching code:', error);
        setCode('// サンプルコード
const hello = () => {
  console.log("Hello, World!");
};

hello();');
        setFileName('sample.js');
      } else if (data) {
        setCode(data.content);
        setFileName(data.file_name);
      }
    };

    fetchCode();
  }, []);

  const handleEdit = () => {
    // 編集画面への遷移ロジックを実装
    console.log('編集ボタンがクリックされました');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen h-full flex flex-col bg-gray-100">
      <Topbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">ソースコード表示</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">{fileName}</h2>
            <div className="space-x-4">
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FiEdit className="mr-2" />
                編集
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FiDownload className="mr-2" />
                ダウンロード
              </button>
            </div>
          </div>
          <div className="border rounded-md overflow-hidden">
            <SyntaxHighlighter
              language="javascript"
              style={docco}
              customStyle={{
                padding: '1rem',
                fontSize: '14px',
                lineHeight: '1.5',
                background: '#f8f8f8',
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeView;