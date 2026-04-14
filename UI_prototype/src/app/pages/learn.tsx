import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { BottomNav } from '../components/bottom-nav';
import { ChevronRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'general',
    label: 'Танд зориулсан',
    italic: true,
    bg: 'rgba(48,52,55,0.07)',
    articles: [
      { id: 'a1', title: 'Дадал хэрхэн үүсдэг вэ?', readTime: '3 мин' },
      { id: 'a2', title: 'Дадлын 4 алхам гэж юу вэ?', readTime: '3 мин' },
    ],
  },
  {
    id: 'creativity',
    label: 'Бүтээлч байдал',
    italic: true,
    bg: 'rgba(227,230,254,0.76)',
    articles: [
      { id: 'a3', title: 'Үр бүтээлтэй байдлыг нэмэгдүүлэх', readTime: '3 мин' },
      { id: 'a4', title: 'Бүтээлч сэтгэлгээг хөгжүүлэх', readTime: '3 мин' },
    ],
  },
  {
    id: 'health',
    label: 'Эрүүл мэнд',
    italic: true,
    bg: '#e3fdee',
    articles: [
      { id: 'a5', title: 'Унтах дадлын ач холбогдол', readTime: '3 мин' },
      { id: 'a6', title: 'Усны хэмжээ ба тархины ажиллагаа', readTime: '3 мин' },
    ],
  },
  {
    id: 'mindset',
    label: 'Сэтгэлгээ',
    italic: true,
    bg: '#f9ecef',
    articles: [
      { id: 'a7', title: 'Growth mindset-ийг хэрхэн хөгжүүлэх', readTime: '3 мин' },
      { id: 'a8', title: 'Дадал эвдрэхэд яах вэ?', readTime: '3 мин' },
    ],
  },
];

function ArticleCard({ title, readTime, bg }: { title: string; readTime: string; bg: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className="flex flex-col justify-between h-[106px] rounded-[24px] p-4 text-left flex-1"
      style={{ backgroundColor: bg, boxShadow: '0px 4px 10px rgba(0,0,0,0.07)' }}
    >
      <p style={{ fontSize: '12px', fontWeight: 500, color: '#202325', lineHeight: 1.4 }}>{title}</p>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '10px', color: 'rgba(0,0,0,0.59)' }}>{readTime}</span>
        <ChevronRight className="w-4 h-4" style={{ color: '#474747' }} />
      </div>
    </motion.button>
  );
}

export function LearnPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-36 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-12 pb-4"
      >
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#202325' }}>
          Дадлын талаар суралцъя
        </p>
      </motion.div>

      {/* Categories */}
      <div className="px-6 flex flex-col gap-[18px]">
        {CATEGORIES.map((cat, ci) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + ci * 0.07 }}
          >
            {/* Category label */}
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#202325',
                fontStyle: 'italic',
                marginBottom: 12,
              }}
            >
              {cat.label}
            </p>

            {/* Article pair */}
            <div className="flex gap-[17px]">
              {cat.articles.map((article) => (
                <ArticleCard key={article.id} title={article.title} readTime={article.readTime} bg={cat.bg} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
