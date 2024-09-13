import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FiUpload } from 'react-icons/fi';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/file-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        router.push('/document-generation');
      }
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      alert('ファイルのアップロードに失敗しました。');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">ファイルアップロード</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-500">ファイルをドロップしてください</p>
            ) : (
              <p className="text-gray-500">
                クリックしてファイルを選択するか、ここにファイルをドラッグ＆ドロップしてください
              </p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              対応ファイル形式: テキストファイル(.txt)、PDFファイル(.pdf)
            </p>
          </div>
          {file && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">選択されたファイル: {file.name}</p>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (!file || uploading) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;