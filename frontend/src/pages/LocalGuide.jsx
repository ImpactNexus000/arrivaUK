import { useState, useEffect } from 'react';
import HeroHeader from '../components/HeroHeader';
import { getGuide } from '../api';

const CATEGORIES = ['All', 'GP', 'Supermarket', 'Pharmacy', 'Restaurant', 'Transport'];

const CATEGORY_ICONS = {
  GP: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  ),
  Supermarket: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  Pharmacy: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Restaurant: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37" />
    </svg>
  ),
  Transport: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
};

const CATEGORY_COLORS = {
  GP: { bg: 'bg-[#FFEAEA]', text: 'text-[#C0392B]' },
  Supermarket: { bg: 'bg-[#E8F9EE]', text: 'text-[#1A7A3A]' },
  Pharmacy: { bg: 'bg-[#E5F0FF]', text: 'text-[#1558B0]' },
  Restaurant: { bg: 'bg-[#FFF3E0]', text: 'text-[#B95C00]' },
  Transport: { bg: 'bg-[#EEE9FF]', text: 'text-[#4A35B0]' },
};

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < full ? 'text-ios-orange' : i === full && half ? 'text-ios-orange' : 'text-[#AEAEB2]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[12px] text-[#6b6b70] ml-1">{rating}</span>
    </div>
  );
}

export default function LocalGuide() {
  const [filter, setFilter] = useState('All');
  const [listings, setListings] = useState([]);
  const [city, setCity] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await getGuide();
        if (!ignore) {
          setListings(data.listings);
          setCity(data.city || '');
          setUniversity(data.university || '');
        }
      } catch {
        // Not logged in or API unavailable
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const INITIAL_COUNT = 8;
  const allFiltered = filter === 'All' ? listings : listings.filter((l) => l.category === filter);
  const filtered = showAll ? allFiltered : allFiltered.slice(0, INITIAL_COUNT);
  const hasMore = allFiltered.length > filtered.length;

  return (
    <div className="pb-24 lg:pb-0">
      <HeroHeader title="Local Guide" subtitle="Nearby services around your campus">
        {city && (
          <p className="text-[12px] text-white/50 mt-1">Based near {university}, {city}</p>
        )}
      </HeroHeader>

      {/* Filter chips */}
      <div className="px-4 lg:px-10 pt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setShowAll(false); }}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-ios-blue text-white'
                  : 'bg-white text-black border border-black/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-10 py-4">
        {loading && (
          <div className="text-center py-16 flex flex-col items-center">
            <svg className="w-8 h-8 animate-spin text-ios-blue mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[14px] text-[#6b6b70]">Loading local listings...</p>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[28px] mb-3">📍</p>
            <p className="text-[16px] font-semibold text-black">No listings yet for your area</p>
            <p className="text-[14px] text-[#6b6b70] mt-1 max-w-[260px] mx-auto">
              We're working on adding local guides for more university cities. Check back soon!
            </p>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-3.5">
          {filtered.map((listing, idx) => {
            const colors = CATEGORY_COLORS[listing.category] || { bg: 'bg-[#F0F0F5]', text: 'text-[#6b6b70]' };
            return (
              <div
                key={idx}
                className="bg-white rounded-[18px] border border-black/[0.08] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 ${colors.text}`}>
                    {CATEGORY_ICONS[listing.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[15px] font-semibold text-black">{listing.name}</p>
                      <span className="text-[12px] text-[#6b6b70] whitespace-nowrap">{listing.distance}</span>
                    </div>
                    <Stars rating={listing.rating} />
                    <p className="text-[13px] text-[#3C3C43] leading-relaxed mt-1.5">{listing.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-4 py-3.5 rounded-[14px] bg-[#F2F2F7] text-[14px] font-semibold text-[#6b6b70]"
          >
            Show All {allFiltered.length} Listings
          </button>
        )}

        {!loading && listings.length > 0 && allFiltered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[28px] mb-3">🔍</p>
            <p className="text-[16px] font-semibold text-black">No listings found</p>
            <p className="text-[14px] text-[#6b6b70] mt-1">No listings in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
