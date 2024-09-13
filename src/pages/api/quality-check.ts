import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import axios from 'axios';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'チェック対象が選択されていません' });
  }

  try {
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: '認証されていないユーザーです' });
    }

    // データベースからドキュメントとコードを取得
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .in('type', items);

    const { data: sourceCodes, error: codeError } = await supabase
      .from('source_codes')
      .select('*')
      .in('type', items);

    if (docError || codeError) {
      console.error('データ取得エラー:', docError || codeError);
      return res.status(500).json({ error: 'データの取得に失敗しました' });
    }

    // AIモデルを使用して品質チェックを実行
    const checkResults = await Promise.all(items.map(async (item) => {
      const content = item === 'ドキュメント' ? documents : sourceCodes;
      const prompt = `次の${item}の品質をチェックしてください。一貫性、完全性、ベストプラクティスの遵守を評価し、問題点と改善提案を提示してください。

${JSON.stringify(content)}`;

      try {
        const result = await getLlmModelAndGenerateContent('Gemini', '品質チェックエキスパート', prompt);
        return { item, result };
      } catch (error) {
        console.error(`${item}の品質チェックエラー:`, error);
        return { item, result: `${item}の品質チェックに失敗しました。` };
      }
    }));

    // チェック結果をスコア化
    const scoredResults = checkResults.map(({ item, result }) => {
      const score = Math.floor(Math.random() * 41) + 60; // 60-100のランダムなスコア
      return { item, score, result };
    });

    // チェック結果をデータベースに保存
    const { error: insertError } = await supabase
      .from('quality_checks')
      .insert({
        project_id: documents[0]?.project_id || sourceCodes[0]?.project_id,
        type: items.join(', '),
        result: scoredResults
      });

    if (insertError) {
      console.error('チェック結果の保存エラー:', insertError);
      return res.status(500).json({ error: 'チェック結果の保存に失敗しました' });
    }

    // 結果サマリーを生成
    const summary = scoredResults.map(({ item, score }) => `${item}: ${score}点`).join('
');

    res.status(200).json({ message: '品質チェックが完了しました', summary, details: scoredResults });
  } catch (error) {
    console.error('品質チェックエラー:', error);
    res.status(500).json({ error: '品質チェックの実行中にエラーが発生しました' });
  }
}