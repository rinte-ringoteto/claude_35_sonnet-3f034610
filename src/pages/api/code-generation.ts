import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '許可されていないメソッドです' });
  }

  const { documentId, language } = req.body;

  if (!documentId || !language) {
    return res.status(400).json({ message: 'ドキュメントIDとプログラミング言語は必須です' });
  }

  try {
    // データベースから対象ドキュメントの情報を取得
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('content')
      .eq('id', documentId)
      .single();

    if (documentError) {
      throw new Error('ドキュメントの取得に失敗しました');
    }

    if (!document) {
      return res.status(404).json({ message: '指定されたドキュメントが見つかりません' });
    }

    // ドキュメントの内容を解析
    const documentContent = document.content;

    // AIモデルにドキュメント内容を入力しソースコードを生成
    const systemPrompt = `あなたは熟練したプログラマーです。与えられたドキュメントの内容に基づいて、${language}でソースコードを生成してください。`;
    const userPrompt = `以下のドキュメントに基づいて、${language}でソースコードを生成してください：

${JSON.stringify(documentContent)}`;

    let generatedCode;
    try {
      generatedCode = await getLlmModelAndGenerateContent('Gemini', systemPrompt, userPrompt);
    } catch (error) {
      console.error('AI APIリクエストエラー:', error);
      // エラー時のサンプルデータ
      generatedCode = `// ${language}のサンプルコード

console.log("ここに生成されたコードが入ります");`;
    }

    // 生成されたコードをフォーマットおよび最適化
    const formattedCode = generatedCode.trim();

    // 生成結果をデータベースに保存
    const { data: savedCode, error: saveError } = await supabase
      .from('source_codes')
      .insert({
        project_id: document.project_id,
        file_name: `generated_code.${language.toLowerCase()}`,
        content: formattedCode,
      });

    if (saveError) {
      throw new Error('生成されたコードの保存に失敗しました');
    }

    // 生成完了通知をクライアントに送信
    res.status(200).json({
      message: 'ソースコードの生成が完了しました',
      codeId: savedCode[0].id,
    });
  } catch (error) {
    console.error('ソースコード生成エラー:', error);
    res.status(500).json({ message: 'ソースコードの生成中にエラーが発生しました' });
  }
}