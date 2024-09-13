import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { documentIds } = req.body;

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    return res.status(400).json({ error: '有効なドキュメントIDが提供されていません' });
  }

  try {
    // データベースから関連するすべてのドキュメントを取得
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .in('id', documentIds);

    if (error) throw error;

    if (!documents || documents.length === 0) {
      return res.status(404).json({ error: '指定されたドキュメントが見つかりません' });
    }

    // AIを使用してドキュメント間の整合性をチェック
    const systemPrompt = "あなたはドキュメント整合性チェックの専門家です。複数のドキュメント間の整合性を分析し、不整合箇所を特定し、改善提案を行います。";
    const userPrompt = `以下のドキュメントの整合性をチェックしてください：

${JSON.stringify(documents)}`;

    const aiResponse = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);

    // AIの応答を解析して結果を構造化
    const consistencyCheckResult = JSON.parse(aiResponse);

    // 結果をデータベースに保存
    const { data: savedResult, error: saveError } = await supabase
      .from('quality_checks')
      .insert({
        project_id: documents[0].project_id, // プロジェクトIDは最初のドキュメントから取得
        type: '整合性',
        result: consistencyCheckResult
      });

    if (saveError) throw saveError;

    // クライアントに結果を返す
    res.status(200).json({
      message: '整合性チェックが完了しました',
      result: consistencyCheckResult
    });

  } catch (error) {
    console.error('整合性チェックエラー:', error);
    res.status(500).json({ error: '整合性チェックの実行中にエラーが発生しました' });
  }
}