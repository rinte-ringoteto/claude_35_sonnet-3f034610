import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import { supabase } from '@/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
  }

  try {
    // メールアドレスでユーザーを検索
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: '認証に失敗しました' });
    }

    // パスワードの検証
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: '認証に失敗しました' });
    }

    // JWTトークンの生成
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Supabase認証を使用してセッションを作成
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(500).json({ error: 'Supabase認証に失敗しました' });
    }

    // AIを使用して歓迎メッセージを生成
    const welcomeMessage = await getLlmModelAndGenerateContent(
      "Gemini",
      "あなたは礼儀正しいアシスタントです。ユーザーに歓迎メッセージを生成してください。",
      `${user.role}のユーザー${user.email}に対する歓迎メッセージを生成してください。`
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      welcomeMessage,
    });
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(500).json({ error: '内部サーバーエラーが発生しました' });
  }
}