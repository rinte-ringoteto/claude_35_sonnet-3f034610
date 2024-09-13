import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { projectId, startDate, endDate } = req.body;

  if (!projectId || !startDate || !endDate) {
    return res.status(400).json({ error: '必要なパラメータが不足しています' });
  }

  try {
    // プロジェクトの全アクティビティログを取得
    const { data: activityLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('project_id', projectId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (logsError) throw logsError;

    // 進捗率の計算
    const phases = ['要件定義', '設計', '開発', 'テスト'];
    const phaseProgress = phases.map(phase => {
      const phaseLogs = activityLogs.filter(log => log.phase === phase);
      const totalTasks = phaseLogs.length;
      const completedTasks = phaseLogs.filter(log => log.status === '完了').length;
      return {
        name: phase,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        status: totalTasks === completedTasks ? '完了' : '進行中'
      };
    });

    const overallProgress = Math.round(phaseProgress.reduce((acc, phase) => acc + phase.progress, 0) / phases.length);

    // 主要な課題や遅延要因の特定
    const prompt = `
      以下のプロジェクト進捗データを分析し、主要な課題や遅延要因を3つ特定してください。
      全体進捗: ${overallProgress}%
      フェーズ別進捗:
      ${phaseProgress.map(p => `${p.name}: ${p.progress}% (${p.status})`).join('
')}
    `;

    const aiResponse = await getLlmModelAndGenerateContent("ChatGPT", "あなたはプロジェクトマネージャーです。", prompt);
    const issues = aiResponse.split('
').filter(line => line.trim() !== '').slice(0, 3);

    // レポートの生成
    const report = {
      overall_progress: overallProgress,
      phases: phaseProgress,
      issues: issues,
      generated_at: new Date().toISOString()
    };

    // レポートをデータベースに保存
    const { data: savedReport, error: saveError } = await supabase
      .from('progress_reports')
      .insert({ project_id: projectId, report: report })
      .select()
      .single();

    if (saveError) throw saveError;

    // レポートのサマリーを生成
    const summary = `
      プロジェクト進捗レポート:
      全体進捗: ${overallProgress}%
      主要な課題:
      ${issues.map((issue, index) => `${index + 1}. ${issue}`).join('
')}
    `;

    res.status(200).json({
      message: 'レポートが正常に生成されました',
      summary: summary,
      reportUrl: `/progress-report-display?id=${savedReport.id}`
    });
  } catch (error) {
    console.error('進捗レポート生成エラー:', error);
    res.status(500).json({
      error: 'レポート生成中にエラーが発生しました',
      message: error.message
    });
  }
}