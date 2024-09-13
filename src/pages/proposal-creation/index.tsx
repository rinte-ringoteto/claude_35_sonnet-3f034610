import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaFileAlt, FaPlay, FaSpinner } from 'react-icons/fa';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import axios from 'axios';

const ProposalCreation = () => {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTemplates();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) {
      console.error('プロジェクトの取得に失敗しました:', error);
      setProjects([{ id: '1', name: 'サンプルプロジェクト1' }, { id: '2', name: 'サンプルプロジェクト2' }]);
    } else {
      setProjects(data);
    }
  };

  const fetchTemplates = async () => {
    // テンプレートの取得処理（実際のAPIエンドポイントに合わせて調整してください）
    try {
      const response = await axios.get('/api/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('テンプレートの取得に失敗しました:', error);
      setTemplates([{ id: '1', name: '基本テンプレート' }, { id: '2', name: '詳細テンプレート' }]);
    }
  };

  const handleCreateProposal = async () => {
    if (!selectedProject || !selectedTemplate) {
      alert('プロジェクトとテンプレートを選択してください。');
      return;
    }

    setIsCreating(true);
    setProgress(0);

    try {
      // 提案資料作成のAPIリクエスト（実際のAPIエンドポイントに合わせて調整してください）
      const response = await axios.post('/api/create-proposal', {
        projectId: selectedProject,
        templateId: selectedTemplate,
      });

      // 進捗状況の更新をシミュレート
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 500);

      // 作成完了後の処理
      setTimeout(() => {
        clearInterval(interval);
        setIsCreating(false);
        router.push('/proposal-display'); // 提案資料表示画面へ遷移
      }, 5000);
    } catch (error) {
      console.error('提案資料の作成に失敗しました:', error);
      setIsCreating(false);
      alert('提案資料の作成に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">提案資料作成</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">1. 資料作成対象の選択</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">プロジェクトを選択してください</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">2. テンプレートの選択</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">テンプレートを選択してください</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center w-full"
          onClick={handleCreateProposal}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              作成中...
            </>
          ) : (
            <>
              <FaPlay className="mr-2" />
              作成開始
            </>
          )}
        </button>
        {isCreating && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">作成進捗</h2>
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCreation;