import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FiFile, FiCode, FiPlay, FiLoader } from 'react-icons/fi';
import axios from 'axios';

const CodeGenerationPage: React.FC = () => {
  const router = useRouter();
  const [selectedDocument, setSelectedDocument] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('id, content')
      .eq('type', '開発');

    if (error) {
      console.error('ドキュメントの取得に失敗しました:', error);
    } else {
      setDocuments(data);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDocument(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const handleGenerateCode = async () => {
    if (!selectedDocument || !selectedLanguage) {
      alert('ドキュメントとプログラミング言語を選択してください。');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const response = await axios.post('/api/code-generation', {
        documentId: selectedDocument,
        language: selectedLanguage,
      });

      const intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(intervalId);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 500);

      setTimeout(() => {
        clearInterval(intervalId);
        setIsGenerating(false);
        setProgress(100);
        router.push('/source-code-display');
      }, 5000);
    } catch (error) {
      console.error('コード生成中にエラーが発生しました:', error);
      setIsGenerating(false);
      alert('コード生成に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">ソースコード生成</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
              生成対象ドキュメント
            </label>
            <select
              id="document"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedDocument}
              onChange={handleDocumentChange}
            >
              <option value="">選択してください</option>
              {documents.map((doc: any) => (
                <option key={doc.id} value={doc.id}>
                  {doc.content.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              プログラミング言語
            </label>
            <select
              id="language"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedLanguage}
              onChange={handleLanguageChange}
            >
              <option value="">選択してください</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
            </select>
          </div>
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                生成中...
              </>
            ) : (
              <>
                <FiPlay className="mr-2" />
                生成開始
              </>
            )}
          </button>
          {isGenerating && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">進捗: {progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeGenerationPage;