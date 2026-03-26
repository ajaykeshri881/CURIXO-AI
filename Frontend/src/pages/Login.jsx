import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/dashboard'); // Will create dashboard next
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col justify-center relative py-24 sm:px-6 lg:px-8">
        
        {/* Soft, modern background gradients matching the landing page theme */}
        <div className="absolute top-[-10%] sm:top-[0%] right-[-10%] sm:right-[-5%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full bg-violet-100/50 blur-3xl opacity-70 mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-[-10%] sm:bottom-[0%] left-[-10%] sm:left-[-5%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full bg-blue-100/50 blur-3xl opacity-70 mix-blend-multiply pointer-events-none" />

        <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-black tracking-tight text-zinc-950">
              Welcome back
            </h2>
            <p className="mt-3 text-lg font-medium text-zinc-600">
              New to Curixo?{' '}
              <Link to="/register" className="font-bold text-violet-600 hover:text-violet-500 transition-colors underline decoration-violet-200 underline-offset-4">
                Create a new account
              </Link>
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl py-10 px-6 sm:px-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)] rounded-3xl border border-white"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-zinc-700">Email address</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 text-sm bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white transition-all outline-none font-medium text-zinc-900 placeholder:text-zinc-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700">Password</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-zinc-200/80 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 text-sm bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white transition-all outline-none font-medium text-zinc-900 placeholder:text-zinc-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-zinc-950 hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-950/10 shadow-xl shadow-zinc-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'Signing in...' : 'Sign in to Curixo'}
                  {!isLoading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
