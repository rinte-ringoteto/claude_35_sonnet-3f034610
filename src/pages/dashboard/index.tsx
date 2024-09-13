import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiFolder, FiFileText, FiCode, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

const Dashboard = () => {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchUser();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('プロジェクトの取得に失敗しました:', error);
    } else {
      setProjects(data);
    }
  };

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    }
  };

  const createNewProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        { name: '新規プロジェクト', created_by: user.id }
      ])
      .select();

    if (error) {
      console.error('プロジェクトの作成に失敗しました:', error);
    } else {
      router.push(`/project/${data[0].id}`);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link href={`/project/${project.id}`} key={project.id}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <p className="text-sm text-gray-500">作成日: {new Date(project.created_at).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={createNewProject}
          className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FiPlus className="mr-2" />
          新規プロジェクト作成
        </button>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">クイックアクセス</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link href="/documents">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
                <FiFileText className="text-3xl mb-2 text-blue-500" />
                <span>ドキュメント</span>
              </div>
            </Link>
            <Link href="/source-code">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
                <FiCode className="text-3xl mb-2 text-green-500" />
                <span>ソースコード</span>
              </div>
            </Link>
            <Link href="/quality-check">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
                <FiCheckCircle className="text-3xl mb-2 text-yellow-500" />
                <span>品質チェック</span>
              </div>
            </Link>
            <Link href="/work-estimate">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
                <FiBarChart2 className="text-3xl mb-2 text-purple-500" />
                <span>工数見積</span>
              </div>
            </Link>
            <Link href="/progress-report">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
                <FiFolder className="text-3xl mb-2 text-red-500" />
                <span>進捗レポート</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;