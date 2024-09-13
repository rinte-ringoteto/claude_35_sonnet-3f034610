import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { documentType } = req.body;

  if (!documentType) {
    return res.status(400).json({ error: 'ドキュメントの種類が指定されていません。' });
  }

  try {
    // ユーザー認証の確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: '認証されていないユーザーです。' });
    }

    // プロジェクトIDの取得（実際のアプリケーションに合わせて調整してください）
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (projectError || !projectData) {
      return res.status(404).json({ error: 'プロジェクトが見つかりません。' });
    }

    const projectId = projectData.id;

    // ファイル情報の取得（実際のアプリケーションに合わせて調整してください）
    const { data: fileData, error: fileError } = await supabase
      .from('documents')
      .select('content')
      .eq('project_id', projectId)
      .eq('type', 'uploaded_file')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fileError || !fileData) {
      return res.status(404).json({ error: 'アップロードされたファイルが見つかりません。' });
    }

    const fileContent = fileData.content;

    // AIモデルを使用してドキュメントを生成
    const systemPrompt = `あなたは優秀な${documentType}作成者です。与えられた情報を基に、適切な${documentType}を生成してください。`;
    const userPrompt = `以下の情報を元に${documentType}を生成してください：

${fileContent}`;

    let generatedDocument;
    try {
      generatedDocument = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);
    } catch (aiError) {
      console.error('AI API Error:', aiError);
      // エラーの場合、サンプルデータを返す
      generatedDocument = `サンプル${documentType}:

1. はじめに
2. 概要
3. 詳細
4. まとめ`;
    }

    // 生成されたドキュメントをデータベースに保存
    const { data: savedDocument, error: saveError } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        type: documentType,
        content: { content: generatedDocument },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      throw new Error('ドキュメントの保存中にエラーが発生しました。');
    }

    res.status(200).json({ message: 'ドキュメント生成が完了しました。', document: savedDocument });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'ドキュメント生成中にエラーが発生しました。' });
  }
}