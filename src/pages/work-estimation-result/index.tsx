import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiBarChart, FiPieChart, FiSliders } from 'react-icons/fi';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';

const WorkEstimationResult = () => {
  const router = useRouter();
  const [workEstimate, setWorkEstimate] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    fetchWorkEstimate();
  }, []);

  const fetchWorkEstimate = async () => {
    try {
      const { data, error } = await supabase
        .from('work_estimates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setWorkEstimate(data);
    } catch (error) {
      console.error('工数見積の取得に失敗しました:', error.message);
      // サンプルデータを表示
      setWorkEstimate({
        estimate: {
          total_hours: 1000,
          breakdown: [
            { phase: '要件定義', hours: 200 },
            { phase: '設計', hours: 300 },
            { phase: '開発', hours: 400 },
            { phase: 'テスト', hours: 100 },
          ],
        },
      });
    }
  };

  const handleAdjustment = () => {
    setIsAdjusting(!isAdjusting);
  };

  const updateEstimate = async (newEstimate) => {
    try {
      const { data, error } = await supabase
        .from('work_estimates')
        .update({ estimate: newEstimate })
        .eq('id', workEstimate.id);

      if (error) throw error;
      setWorkEstimate({ ...workEstimate, estimate: newEstimate });
      setIsAdjusting(false);
    } catch (error) {
      console.error('工数見積の更新に失敗しました:', error.message);
    }
  };

  if (!workEstimate) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">工数見積結果</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              <FiBarChart className="inline-block mr-2" />
              総工数
            </h2>
            <span className="text-3xl font-bold text-blue-600">
              {workEstimate.estimate.total_hours}時間
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            <FiPieChart className="inline-block mr-2" />
            フェーズ別工数内訳
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workEstimate.estimate.breakdown.map((phase, index) => (
              <div key={index} className="bg-gray-50 rounded p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">{phase.phase}</h3>
                <p className="text-2xl font-bold text-blue-600">{phase.hours}時間</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              <FiSliders className="inline-block mr-2" />
              工数調整オプション
            </h2>
            <button
              onClick={handleAdjustment}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              {isAdjusting ? '調整を完了' : '工数を調整'}
            </button>
          </div>
          {isAdjusting && (
            <div className="mt-4">
              {workEstimate.estimate.breakdown.map((phase, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`phase-${index}`}>
                    {phase.phase}
                  </label>
                  <input
                    id={`phase-${index}`}
                    type="number"
                    value={phase.hours}
                    onChange={(e) => {
                      const newBreakdown = [...workEstimate.estimate.breakdown];
                      newBreakdown[index].hours = parseInt(e.target.value);
                      const newTotalHours = newBreakdown.reduce((sum, p) => sum + p.hours, 0);
                      updateEstimate({
                        ...workEstimate.estimate,
                        total_hours: newTotalHours,
                        breakdown: newBreakdown,
                      });
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/project-plan">
            <span className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              プロジェクト計画に反映
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WorkEstimationResult;