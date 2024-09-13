import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { FaPlay, FaChartBar } from 'react-icons/fa';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

const WorkEstimation: React.FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [estimationProgress, setEstimationProgress] = useState<number>(0);
  const [isEstimating, setIsEstimating] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name');
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('プロジェクトの取得に失敗しました:', error);
      setProjects([
        { id: '1', name: 'プロジェクトA' },
        { id: '2', name: 'プロジェクトB' },
        { id: '3', name: 'プロジェクトC' },
      ]);
    }
  };

  const startEstimation = async () => {
    if (!selectedProject) {
      alert('プロジェクトを選択してください');
      return;
    }

    setIsEstimating(true);
    setEstimationProgress(0);

    try {
      const response = await axios.post('/api/work-estimation', { projectId: selectedProject });
      
      // 進捗のシミュレーション
      for (let i = 0; i <= 100; i += 10) {
        setEstimationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      router.push('/work-estimation-result');
    } catch (error) {
      console.error('工数見積に失敗しました:', error);
      alert('工数見積に失敗しました。もう一度お試しください。');
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">工数見積画面</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
              見積対象プロジェクト
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">プロジェクトを選択してください</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={startEstimation}
            disabled={isEstimating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
          >
            <FaPlay className="mr-2" />
            見積開始
          </button>
          {isEstimating && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">見積進捗</h2>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${estimationProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{estimationProgress}% 完了</p>
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WorkEstimation;