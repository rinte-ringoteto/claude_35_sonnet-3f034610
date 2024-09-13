import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaChartLine, FaCalendarAlt, FaPlayCircle } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';

const ProgressReportPage: React.FC = () => {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('id, name');
      if (error) throw error;
      setProjects(data);
    } catch (error) {
      console.error('プロジェクトの取得に失敗しました:', error);
      setProjects([
        { id: '1', name: 'プロジェクトA' },
        { id: '2', name: 'プロジェクトB' },
        { id: '3', name: 'プロジェクトC' },
      ]);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedProject || !startDate || !endDate) {
      alert('すべての項目を入力してください。');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // 進捗をシミュレート
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(i);
      }

      const { data, error } = await supabase
        .from('progress_reports')
        .insert({
          project_id: selectedProject,
          report: {
            overall_progress: 75,
            phases: [
              { name: '要件定義', progress: 100, status: '完了' },
              { name: '設計', progress: 90, status: '進行中' },
              { name: '開発', progress: 60, status: '進行中' },
              { name: 'テスト', progress: 20, status: '進行中' },
            ],
          },
        })
        .select();

      if (error) throw error;

      router.push('/progress-report-display');
    } catch (error) {
      console.error('レポート生成に失敗しました:', error);
      alert('レポート生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100 flex flex-col">
      <Topbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">進捗レポート生成</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="project">
              レポート対象プロジェクト
            </label>
            <select
              id="project"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              開始日
            </label>
            <input
              type="date"
              id="startDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
              終了日
            </label>
            <input
              type="date"
              id="endDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <BiLoaderAlt className="animate-spin mr-2" />
                生成中...
              </>
            ) : (
              <>
                <FaPlayCircle className="mr-2" />
                レポート生成開始
              </>
            )}
          </button>
          {isGenerating && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-sm text-gray-600">
                進捗: {progress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressReportPage;