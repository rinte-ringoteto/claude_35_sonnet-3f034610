import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { projectId, templateId } = req.body;

  if (!projectId || !templateId) {
    return res.status(400).json({ error: 'プロジェクトIDとテンプレートIDが必要です' });
  }

  try {
    // プロジェクト情報と関連ドキュメントを取得
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*, documents(*)')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // テンプレートを取得
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // AIを使用して提案資料を生成
    const systemPrompt = `あなたは優秀な提案資料作成の専門家です。提供されたプロジェクト情報とドキュメントを基に、説得力のある提案資料を作成してください。`;
    const userPrompt = `プロジェクト: ${JSON.stringify(projectData)}
テンプレート: ${JSON.stringify(templateData)}
これらの情報を基に、提案資料を作成してください。`;

    const proposalContent = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);

    // PDFに変換（この部分は実際のPDF変換ライブラリに置き換える必要があります）
    const pdfBuffer = await convertToPdf(proposalContent);

    // 生成された資料をデータベースに保存
    const { data: savedProposal, error: saveError } = await supabase
      .from('proposals')
      .insert({
        project_id: projectId,
        content: proposalContent,
        pdf_url: 'URL will be updated after storage',
      })
      .single();

    if (saveError) throw saveError;

    // PDFをストレージにアップロード
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('proposals')
      .upload(`${savedProposal.id}.pdf`, pdfBuffer);

    if (uploadError) throw uploadError;

    // 提案資料のURLを更新
    const { data: updatedProposal, error: updateError } = await supabase
      .from('proposals')
      .update({ pdf_url: fileData.path })
      .eq('id', savedProposal.id)
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ message: '提案資料が正常に作成されました', proposalId: updatedProposal.id });
  } catch (error) {
    console.error('提案資料の作成中にエラーが発生しました:', error);
    res.status(500).json({ error: '提案資料の作成に失敗しました', details: error.message });
  }
}

// PDF変換のモック関数（実際のPDF変換ライブラリに置き換える必要があります）
async function convertToPdf(content: string): Promise<Buffer> {
  // この部分は実際のPDF変換ロジックに置き換えてください
  return Buffer.from(content);
}