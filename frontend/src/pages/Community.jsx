import { useEffect, useState } from 'react';
import HeroHeader from '../components/HeroHeader';
import Badge from '../components/Badge';
import AddModal from '../components/AddModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { getPosts, createPost, updatePost, deletePost, likePost, replyToPost } from '../api';

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

const PAGE_SIZE = 10;

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [form, setForm] = useState({ content: '', category: 'general' });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ content: '', category: '' });
  const [menuOpen, setMenuOpen] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  const currentUserId = Number(localStorage.getItem('arrivauk_user_id'));

  const load = async () => {
    try {
      const data = await getPosts(0, PAGE_SIZE);
      setPosts(data.posts);
      setTotal(data.total);
      setHasMore(data.has_more);
    } catch {}
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await getPosts(posts.length, PAGE_SIZE);
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.has_more);
    } catch {}
    setLoadingMore(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createPost(form);
      toast('Post shared', 'success');
      setForm({ content: '', category: 'general' });
      setShowAdd(false);
      load();
    } catch {
      toast('Failed to post', 'error');
    }
    setSubmitting(false);
  };

  const handleLike = async (postId) => {
    try { await likePost(postId); load(); } catch {}
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return;
    try {
      await replyToPost(postId, { content: replyText });
      toast('Reply sent', 'success');
      setReplyText('');
      setReplyingTo(null);
      load();
    } catch {
      toast('Failed to send reply', 'error');
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setEditForm({ content: post.content, category: post.category });
    setMenuOpen(null);
  };

  const handleEditSave = async (postId) => {
    if (!editForm.content.trim()) return;
    try {
      await updatePost(postId, editForm);
      toast('Post updated', 'success');
      setEditingId(null);
      load();
    } catch {
      toast('Failed to update', 'error');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      toast('Post deleted', 'success');
      setMenuOpen(null);
      load();
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  const filtered = filter === 'All'
    ? posts
    : posts.filter((p) => p.category === CATEGORY_MAP[filter]);

  const isOwner = (post) => post.user_id && post.user_id === currentUserId;

  return (
    <div className="pb-24 lg:pb-0">
      <HeroHeader title="Community" subtitle={`${total} ${total === 1 ? 'tip' : 'tips'} shared by students`} />

      {/* Filter chips */}
      <div className="px-4 lg:px-10 pt-4 pb-1 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-ios-blue text-white shadow-sm'
                  : 'bg-white text-[#6b6b70] border border-black/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-10 py-4">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[28px] mb-3">💬</p>
            <p className="text-[16px] font-semibold text-black">No posts yet</p>
            <p className="text-[14px] text-[#6b6b70] mt-1">Be the first to share a tip!</p>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-3.5">
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
                      {(post.author_name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-black">
                      {post.author_name}
                      {isOwner(post) && <span className="text-[11px] text-ios-blue font-normal ml-1.5">You</span>}
                    </p>
                    <p className="text-[11px] text-[#AEAEB2]">{timeAgo(post.created_at)}</p>
                  </div>
                  <Badge variant={categoryBadge(post.category)}>
                    {REVERSE_MAP[post.category] || post.category}
                  </Badge>

                  {/* Three-dot menu for own posts */}
                  {isOwner(post) && editingId !== post.id && (
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors"
                      >
                        <svg className="w-4 h-4 text-[#AEAEB2]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {menuOpen === post.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-black/[0.08] overflow-hidden min-w-[140px]">
                            <button
                              onClick={() => handleEdit(post)}
                              className="w-full px-4 py-2.5 text-left text-[14px] text-black hover:bg-black/[0.03] flex items-center gap-2.5"
                            >
                              <svg className="w-4 h-4 text-[#6b6b70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                              </svg>
                              Edit
                            </button>
                            <div className="h-px bg-black/[0.06]" />
                            <button
                              onClick={() => { setConfirmDelete(post.id); setMenuOpen(null); }}
                              className="w-full px-4 py-2.5 text-left text-[14px] text-ios-red hover:bg-ios-red/[0.04] flex items-center gap-2.5"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Content — or edit form */}
                {editingId === post.id ? (
                  <div className="mt-3 flex flex-col gap-2.5">
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-ios-blue/30 text-[14px] outline-none focus:border-ios-blue resize-none bg-ios-blue/[0.03]"
                      autoFocus
                    />
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {Object.entries(CATEGORY_MAP).map(([label, value]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, category: value })}
                          className={`px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${
                            editForm.category === value
                              ? 'bg-ios-blue text-white'
                              : 'bg-[#F2F2F7] text-[#6b6b70]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-2 rounded-xl bg-[#F2F2F7] text-[13px] font-semibold text-[#6b6b70]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(post.id)}
                        className="flex-1 py-2 rounded-xl bg-ios-blue text-[13px] font-semibold text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] text-[#3C3C43] leading-relaxed mt-3">
                    {post.content}
                  </p>
                )}

                {/* Actions */}
                {editingId !== post.id && (
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
                )}
              </div>

              {/* Expanded replies */}
              {expandedPost === post.id && post.replies.length > 0 && (
                <div className="bg-[#F2F2F7] px-4 py-3 flex flex-col gap-2.5">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-navy-mid flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-white">
                          {(reply.author_name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px]">
                          <span className="font-semibold text-black">{reply.author_name || 'Anonymous'}</span>
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

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full mt-4 py-3.5 rounded-[14px] bg-[#F2F2F7] text-[14px] font-semibold text-[#6b6b70] disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        )}

        <button
          onClick={() => setShowAdd(true)}
          className="w-full lg:col-span-2 mt-3 py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight"
        >
          Share a Tip
        </button>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Delete Post?"
        message="This action cannot be undone."
      />

      <AddModal open={showAdd} onClose={() => setShowAdd(false)} title="Share with the Community">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <textarea
            placeholder="Share your tip or experience..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue resize-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(CATEGORY_MAP).map(([label, value]) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, category: value })}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  form.category === value
                    ? 'bg-ios-blue text-white'
                    : 'bg-[#F2F2F7] text-[#6b6b70]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!form.content.trim() || submitting}
            className="w-full py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight mt-1 disabled:opacity-40"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </AddModal>
    </div>
  );
}
