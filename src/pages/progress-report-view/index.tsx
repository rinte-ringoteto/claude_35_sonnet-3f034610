import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaChartLine, FaList, FaExclamationTriangle } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProgressReportView: React.FC = () => {
  const router = useRouter();
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const { data, error } = await supabase
          .from('progress_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        setProgressData(data);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        // サンプルデータを設定
        setProgressData({
          overall_progress: 65,
          phases: [
            { name: '要件定義', progress: 100, status: '完了' },
            { name: 'システム設計', progress: 80, status: '進行中' },
            { name: '開発', progress: 40, status: '進行中' },
            { name: 'テスト', progress: 0, status: '未着手' },
          ],
          issues: [
            { title: 'システム設計の遅延', description: 'クライアントとの調整に時間がかかっている' },
            { title: '開発リソースの不足', description: '追加の開発者が必要' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return <div className="min-h-screen h-full flex items-center justify-center">読み込み中...</div>;
  }

  const chartData = {
    labels: progressData.phases.map((phase: any) => phase.name),
    datasets: [
      {
        label: '進捗率',
        data: progressData.phases.map((phase: any) => phase.progress),
        fill: false,
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '進捗率 (%)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">進捗レポート</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" />
              全体進捗グラフ
            </h2>
            <div className="mb-4">
              <Line data={chartData} options={chartOptions} />
            </div>
            <p className="text-lg font-medium text-center">
              全体進捗: {progressData.overall_progress}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaList className="mr-2 text-green-500" />
              フェーズ別進捗状況
            </h2>
            <ul>
              {progressData.phases.map((phase: any, index: number) => (
                <li key={index} className="mb-2 flex justify-between items-center">
                  <span>{phase.name}</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    phase.status === '完了' ? 'bg-green-200 text-green-800' :
                    phase.status === '進行中' ? 'bg-blue-200 text-blue-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {phase.status} ({phase.progress}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2 text-yellow-500" />
            課題リスト
          </h2>
          {progressData.issues && progressData.issues.length > 0 ? (
            <ul>
              {progressData.issues.map((issue: any, index: number) => (
                <li key={index} className="mb-4">
                  <h3 className="font-medium text-lg">{issue.title}</h3>
                  <p className="text-gray-600">{issue.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>現在、重要な課題はありません。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressReportView;