import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: 'プロジェクトIDが必要です' });
  }

  try {
    // プロジェクト関連の成果物を取得
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId);

    if (documentsError) throw documentsError;

    const { data: sourceCodes, error: sourceCodesError } = await supabase
      .from('source_codes')
      .select('*')
      .eq('project_id', projectId);

    if (sourceCodesError) throw sourceCodesError;

    // AIモデルを使用して工数を見積もる
    const systemPrompt = "あなたはソフトウェア開発の工数見積の専門家です。プロジェクトの詳細情報をもとに、適切な工数見積を行ってください。";
    const userPrompt = `
      プロジェクト名: ${projectData.name}
      プロジェクト説明: ${projectData.description}
      ドキュメント数: ${documents.length}
      ソースコードファイル数: ${sourceCodes.length}
      
      このプロジェクトの工数を見積もってください。結果はJSON形式で返してください。
      フォーマット:
      {
        "totalHours": 合計工数（時間）,
        "breakdown": [
          {
            "phase": フェーズ名,
            "hours": 工数（時間）
          },
          ...
        ]
      }
    `;

    const estimationResult = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);

    let parsedEstimation;
    try {
      parsedEstimation = JSON.parse(estimationResult);
    } catch (error) {
      console.error('AIの出力を解析できませんでした:', error);
      // サンプルデータを返す
      parsedEstimation = {
        totalHours: 1000,
        breakdown: [
          { phase: "要件定義", hours: 200 },
          { phase: "設計", hours: 300 },
          { phase: "実装", hours: 400 },
          { phase: "テスト", hours: 100 }
        ]
      };
    }

    // 見積結果をデータベースに保存
    const { data: savedEstimation, error: saveError } = await supabase
      .from('work_estimates')
      .insert({
        project_id: projectId,
        estimate: parsedEstimation
      })
      .single();

    if (saveError) throw saveError;

    return res.status(200).json(parsedEstimation);
  } catch (error) {
    console.error('工数見積中にエラーが発生しました:', error);
    return res.status(500).json({ error: '工数見積の処理中にエラーが発生しました' });
  }
}