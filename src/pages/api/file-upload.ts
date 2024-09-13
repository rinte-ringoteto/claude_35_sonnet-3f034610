import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'tmp');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('ファイル解析エラー:', err);
      return res.status(500).json({ error: 'ファイルのアップロードに失敗しました' });
    }

    const file = files.file as formidable.File;
    if (!file) {
      return res.status(400).json({ error: 'ファイルが見つかりません' });
    }

    const allowedTypes = ['text/plain', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: '許可されていないファイル形式です' });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'ファイルサイズが大きすぎます' });
    }

    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`${Date.now()}_${file.originalFilename}`, fs.createReadStream(file.filepath));

      if (error) throw error;

      const { data: insertData, error: insertError } = await supabase
        .from('documents')
        .insert({
          project_id: fields.project_id,
          type: 'uploaded_file',
          content: JSON.stringify({ file_path: data.path }),
        });

      if (insertError) throw insertError;

      fs.unlinkSync(file.filepath);

      res.status(200).json({ message: 'ファイルが正常にアップロードされました', filePath: data.path });
    } catch (error) {
      console.error('ファイル保存エラー:', error);
      res.status(500).json({ error: 'ファイルの保存中にエラーが発生しました' });
    }
  });
}