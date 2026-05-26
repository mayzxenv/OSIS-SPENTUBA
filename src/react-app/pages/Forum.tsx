import Navbar from '../components/Navbar';
import { ArrowLeft, Clock, Eye, Lock, MessageCircle, MessageSquare, Pin, Reply, Send, ThumbsUp, TrendingUp, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { apiUrl } from '@/react-app/lib/api';

type ForumThread = {
  id: number;
  user_name: string;
  title: string;
  content: string;
  category: string;
  is_pinned?: number | boolean;
  is_locked?: number | boolean;
  likes: number;
  replies: number;
  views: number;
  created_at?: string;
};

type ForumReply = {
  id: number;
  thread_id: number;
  user_name: string;
  content: string;
  likes: number;
  created_at: string;
};

export default function Forum() {
  const [showNewThread, setShowNewThread] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [threadCategory, setThreadCategory] = useState<string>('');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [expandedThreadId, setExpandedThreadId] = useState<number | null>(null);
  const [repliesByThread, setRepliesByThread] = useState<Record<number, ForumReply[]>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<number, { user_name: string; content: string }>>({});
  const [threadAuthor, setThreadAuthor] = useState('');
  const [isAnonymousThread, setIsAnonymousThread] = useState(false);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadContent, setThreadContent] = useState('');
  const [threadError, setThreadError] = useState('');
  const [threadSuccess, setThreadSuccess] = useState('');
  const [forumError, setForumError] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [replyingThreadId, setReplyingThreadId] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'Semua', icon: MessageSquare, color: 'text-gray-600' },
    { id: 'event', name: 'Event', icon: TrendingUp, color: 'text-blue-600' },
    { id: 'kritik', name: 'Kritik & Saran', icon: MessageCircle, color: 'text-orange-600' },
    { id: 'ide', name: 'Ide Kegiatan', icon: MessageSquare, color: 'text-purple-600' },
  ];

  const fetchThreads = async () => {
    try {
      const response = await fetch(apiUrl('/api/forum/threads'));
      if (!response.ok) {
        setForumError(`Gagal memuat thread forum. Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      setThreads(Array.isArray(data) ? data : []);
      setForumError('');
    } catch (error) {
      console.error('Error loading forum threads:', error);
      setForumError('Tidak dapat terhubung ke server forum.');
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const filteredThreads = selectedCategory === 'all'
    ? threads
    : threads.filter((thread) => thread.category === selectedCategory);

  const todayThreadsCount = threads.filter((thread) => {
    if (!thread.created_at) return false;
    const created = new Date(thread.created_at);
    const now = new Date();
    return created.toDateString() === now.toDateString();
  }).length;

  const stats = [
    { icon: MessageSquare, value: threads.length.toString(), label: 'Thread Aktif', color: 'text-blue-600' },
    { icon: MessageCircle, value: threads.reduce((sum, t) => sum + Number(t.replies || 0), 0).toString(), label: 'Total Balasan', color: 'text-purple-600' },
    { icon: TrendingUp, value: todayThreadsCount.toString(), label: 'Aktivitas Hari Ini', color: 'text-green-600' },
  ];

  const loadReplies = async (threadId: number) => {
    if (repliesByThread[threadId]) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/forum/threads/${threadId}/replies`));
      if (response.ok) {
        const data = await response.json();
        setRepliesByThread((prev) => ({ ...prev, [threadId]: Array.isArray(data) ? data : [] }));
      }
    } catch (error) {
      console.error('Error loading thread replies:', error);
    }
  };

  const handleLikeThread = async (threadId: number) => {
    setThreads((prev) => prev.map((thread) => (thread.id === threadId ? { ...thread, likes: Number(thread.likes || 0) + 1 } : thread)));

    try {
      const response = await fetch(apiUrl(`/api/forum/threads/${threadId}/like`), { method: 'POST' });
      if (response.ok) {
        const payload = await response.json();
        if (payload?.thread) {
          setThreads((prev) => prev.map((thread) => (thread.id === threadId ? { ...thread, likes: Number(payload.thread.likes || thread.likes) } : thread)));
        }
      }
    } catch (error) {
      console.error('Error liking thread:', error);
    }
  };

  const handleLikeReply = async (threadId: number, replyId: number) => {
    try {
      const response = await fetch(apiUrl(`/api/forum/replies/${replyId}/like`), { method: 'POST' });
      if (response.ok) {
        const payload = await response.json();
        if (payload?.reply) {
          setRepliesByThread((prev) => ({
            ...prev,
            [threadId]: (prev[threadId] || []).map((reply) =>
              reply.id === replyId ? { ...reply, likes: Number(payload.reply.likes || reply.likes) } : reply
            ),
          }));
        }
      }
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleReplySubmit = async (threadId: number) => {
    const draft = replyDrafts[threadId];
    if (!draft?.user_name.trim() || !draft?.content.trim()) {
      return;
    }

    setReplyingThreadId(threadId);
    try {
      const response = await fetch(apiUrl(`/api/forum/threads/${threadId}/replies`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.reply) {
          setRepliesByThread((prev) => ({
            ...prev,
            [threadId]: [...(prev[threadId] || []), payload.reply],
          }));
          setThreads((prev) => prev.map((thread) => (thread.id === threadId ? { ...thread, replies: Number(thread.replies || 0) + 1 } : thread)));
          setReplyDrafts((prev) => ({
            ...prev,
            [threadId]: { user_name: '', content: '' },
          }));
        }
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setReplyingThreadId(null);
    }
  };

  const handleNewThreadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setThreadError('');
    setThreadSuccess('');

    if ((!isAnonymousThread && !threadAuthor.trim()) || !threadTitle.trim() || !threadCategory || !threadContent.trim()) {
      setThreadError('Mohon lengkapi semua kolom thread.');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch(apiUrl('/api/forum/threads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: isAnonymousThread ? 'Anonim' : threadAuthor,
          user_avatar: '',
          title: threadTitle,
          content: threadContent,
          category: threadCategory,
        }),
      });

      if (response.ok) {
        setThreadSuccess('Thread berhasil dikirim.');
        setThreadAuthor('');
        setIsAnonymousThread(false);
        setThreadTitle('');
        setThreadContent('');
        setThreadCategory('');
        await fetchThreads();
      } else {
        setThreadError('Gagal mengirim thread. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error posting thread:', error);
      setThreadError('Terjadi kesalahan saat mengirim thread.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <div className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_35%),linear-gradient(to_bottom,_#f8fbff,_#ffffff_35%,_#f8fafc)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur hover:text-blue-600">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Home
            </Link>

            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-black leading-tight font-['Space_Grotesk']">
                  <span className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 bg-clip-text text-transparent">
                    Forum Diskusi
                  </span>
                </h1>
                <p className="mt-3 text-base md:text-lg text-slate-600">
                  Tempat berbagi pendapat, memberi balasan, dan menyukai diskusi yang bermanfaat.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                  </div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {forumError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                {forumError}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNewThread(!showNewThread)}
              className="lg:ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-transform hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4" />
              Buat Thread Baru
            </button>
          </div>

          {showNewThread && (
            <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <h3 className="text-2xl font-black text-slate-900 mb-4">Buat Diskusi Baru</h3>
              <form className="space-y-4" onSubmit={handleNewThreadSubmit}>
                {threadError && <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{threadError}</div>}
                {threadSuccess && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">{threadSuccess}</div>}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Pengirim *</label>
                    <input
                      type="text"
                      value={threadAuthor}
                      onChange={(e) => setThreadAuthor(e.target.value)}
                      placeholder={isAnonymousThread ? 'Dikosongkan saat anonim aktif' : 'Nama kamu'}
                      disabled={isAnonymousThread}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-shadow disabled:bg-slate-100 disabled:text-slate-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                    />
                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={isAnonymousThread}
                        onChange={(e) => setIsAnonymousThread(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Kirim sebagai anonim
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Judul Thread *</label>
                    <input
                      type="text"
                      value={threadTitle}
                      onChange={(e) => setThreadTitle(e.target.value)}
                      placeholder="Contoh: Usulan Kegiatan Bakti Sosial Bulanan"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Kategori *</label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {categories.filter((cat) => cat.id !== 'all').map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setThreadCategory(cat.id)}
                        className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                          threadCategory === cat.id
                            ? 'border-transparent bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <cat.icon className={`w-4 h-4 ${threadCategory === cat.id ? 'text-white' : cat.color}`} />
                          <span>{cat.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Konten *</label>
                  <textarea
                    rows={5}
                    value={threadContent}
                    onChange={(e) => setThreadContent(e.target.value)}
                    placeholder="Tulis topik diskusi kamu di sini..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isPosting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-opacity disabled:opacity-70"
                  >
                    <Send className="w-4 h-4" />
                    {isPosting ? 'Mengirim...' : 'Posting Thread'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewThread(false)}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {filteredThreads.map((thread) => {
              const isExpanded = expandedThreadId === thread.id;
              const threadReplies = repliesByThread[thread.id] || [];
              const replyDraft = replyDrafts[thread.id] || { user_name: '', content: '' };

              return (
                <article key={thread.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
                  <div className="p-5 sm:p-6">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                        <UserRound className="w-6 h-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {(thread.is_pinned || (thread as any).isPinned) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </span>
                          )}
                          {(thread.is_locked || (thread as any).isLocked) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                            {categories.find((c) => c.id === thread.category)?.name || thread.category}
                          </span>
                        </div>

                        <h3 className="mt-3 text-2xl font-black text-slate-900">{thread.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm md:text-base text-slate-600">{thread.content}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="font-semibold text-slate-700">{thread.user_name || 'Anonim'}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {thread.created_at ? new Date(thread.created_at).toLocaleString('id-ID') : 'Baru saja'}
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => void handleLikeThread(thread.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {thread.likes || 0}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setExpandedThreadId(isExpanded ? null : thread.id);
                              await loadReplies(thread.id);
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {thread.replies || 0} balasan
                          </button>
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                            <Eye className="w-4 h-4" />
                            {thread.views || 0}
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              setExpandedThreadId(thread.id);
                              await loadReplies(thread.id);
                            }}
                            className="ml-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
                          >
                            {isExpanded ? 'Tutup Thread' : 'Baca Thread'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
                          <div>
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <Reply className="w-4 h-4" />
                              Balas Thread
                            </div>

                            <div className="space-y-3">
                              <input
                                type="text"
                                value={replyDraft.user_name}
                                onChange={(e) =>
                                  setReplyDrafts((prev) => ({
                                    ...prev,
                                    [thread.id]: { ...replyDraft, user_name: e.target.value },
                                  }))
                                }
                                placeholder="Nama kamu"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                              />
                              <textarea
                                rows={4}
                                value={replyDraft.content}
                                onChange={(e) =>
                                  setReplyDrafts((prev) => ({
                                    ...prev,
                                    [thread.id]: { ...replyDraft, content: e.target.value },
                                  }))
                                }
                                placeholder="Tulis balasan yang sopan dan membantu..."
                                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                              />
                              <button
                                type="button"
                                onClick={() => void handleReplySubmit(thread.id)}
                                disabled={replyingThreadId === thread.id}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
                              >
                                <Send className="w-4 h-4" />
                                {replyingThreadId === thread.id ? 'Mengirim...' : 'Kirim balasan'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="mb-4 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                              <span>Daftar Balasan</span>
                              <span>{threadReplies.length} item</span>
                            </div>

                            <div className="space-y-3">
                              {threadReplies.length === 0 ? (
                                <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">Belum ada balasan. Jadilah yang pertama merespons.</p>
                              ) : (
                                threadReplies.map((reply) => (
                                  <div key={reply.id} className="rounded-2xl bg-white p-4 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-semibold text-slate-800">{reply.user_name}</p>
                                      <span className="text-xs text-slate-500">{new Date(reply.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{reply.content}</p>
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                      <button
                                        type="button"
                                        onClick={() => void handleLikeReply(thread.id, reply.id)}
                                        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600"
                                      >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        {reply.likes || 0}
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
