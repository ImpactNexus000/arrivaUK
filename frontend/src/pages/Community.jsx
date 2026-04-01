import { useEffect, useState } from 'react';
import Badge from '../components/Badge';
import AddModal from '../components/AddModal';
import { getPosts, createPost, likePost, replyToPost } from '../api';

const CATEGORIES = ['All', 'Banks', 'NI Number', 'Shopping', 'Housing', 'Transport', 'General'];
const CATEGORY_MAP = {
  Banks: 'banks',
  'NI Number': 'ni_number',
  Shopping: 'shopping',
  Housing: 'housing',
  Transport: 'transport',
  General: 'general',
};
const REVERSE_MAP = Object.fromEntries(Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k]));

const categoryBadge = (cat) => {
  const map = { banks: 'green', ni_number: 'blue', shopping: 'orange', housing: 'purple', transport: 'blue', general: 'gray' };
  return map[cat] || 'gray';
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [form, setForm] = useState({ content: '', category: 'general' });

  const userName = (() => {
    try {
      return localStorage.getItem('arrivauk_user_name') || 'Anonymous';
    } catch {
      return 'Anonymous';
    }
  })();

  const load = async () => {
    try {
      setPosts(await getPosts());
    } catch {
      // API not available
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    await createPost({ author_name: userName, ...form });
    setForm({ content: '', category: 'general' });
    setShowAdd(false);
    load();
  };

  const handleLike = async (postId) => {
    await likePost(postId);
    load();
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return;
    await replyToPost(postId, { author_name: userName, content: replyText });
    setReplyText('');
    setReplyingTo(null);
    load();
  };

  const filtered = filter === 'All'
    ? posts
    : posts.filter((p) => p.category === CATEGORY_MAP[filter]);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.08] px-5 pb-4 pt-14">
        <h1 className="text-[26px] font-bold tracking-tight text-black">Community</h1>
        <p className="text-[14px] text-[#6b6b70] mt-1">
          {posts.length} {posts.length === 1 ? 'tip' : 'tips'} shared by students
        </p>

        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-ios-blue text-white'
                  : 'bg-[#F2F2F7] text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px] text-[#AEAEB2]">No posts yet. Be the first to share!</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-[18px] border border-black/[0.08] overflow-hidden"
            >
              <div className="p-4">
                {/* Author row */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-bold text-white">
                      {post.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-black">{post.author_name}</p>
                    <p className="text-[11px] text-[#AEAEB2]">{timeAgo(post.created_at)}</p>
                  </div>
                  <Badge variant={categoryBadge(post.category)}>
                    {REVERSE_MAP[post.category] || post.category}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-[14px] text-[#3C3C43] leading-relaxed mt-3">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/[0.06]">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-[13px] text-[#6b6b70]"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.likes_count}
                  </button>
                  <button
                    onClick={() => {
                      setExpandedPost(expandedPost === post.id ? null : post.id);
                      setReplyingTo(null);
                    }}
                    className="flex items-center gap-1.5 text-[13px] text-[#6b6b70]"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.replies.length}
                  </button>
                  <button
                    onClick={() => {
                      setExpandedPost(post.id);
                      setReplyingTo(post.id);
                    }}
                    className="text-[13px] font-semibold text-ios-blue ml-auto"
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* Expanded replies */}
              {expandedPost === post.id && post.replies.length > 0 && (
                <div className="bg-[#F2F2F7] px-4 py-3 flex flex-col gap-2.5">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-navy-mid flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-white">
                          {reply.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px]">
                          <span className="font-semibold text-black">{reply.author_name}</span>
                          <span className="text-[#AEAEB2] ml-2 text-[11px]">{timeAgo(reply.created_at)}</span>
                        </p>
                        <p className="text-[13px] text-[#3C3C43] mt-0.5">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyingTo === post.id && (
                <div className="px-4 py-3 border-t border-black/[0.06] flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReply(post.id)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F2F2F7] text-[14px] outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleReply(post.id)}
                    className="px-4 py-2 rounded-xl bg-ios-blue text-white text-[13px] font-semibold"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="w-full mt-4 py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight"
        >
          Share a Tip
        </button>
      </div>

      <AddModal open={showAdd} onClose={() => setShowAdd(false)} title="Share with the Community">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <textarea
            placeholder="Share your tip or experience..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue resize-none"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue bg-white"
          >
            {Object.entries(CATEGORY_MAP).map(([label, value]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight mt-1"
          >
            Post
          </button>
        </form>
      </AddModal>
    </div>
  );
}
