import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';

type Category = 'general' | 'creativity' | 'health' | 'mindset';

const CATEGORIES: { key: Category; label: string; emoji: string; color: string }[] = [
  { key: 'general',    label: 'Ерөнхий',        emoji: '📖', color: '#8B7EC8' },
  { key: 'creativity', label: 'Бүтээлч байдал', emoji: '🎨', color: '#E8A87C' },
  { key: 'health',     label: 'Эрүүл мэнд',    emoji: '❤️', color: '#7EC8A8' },
  { key: 'mindset',    label: 'Сэтгэлгээ',     emoji: '🧠', color: '#7EB1C8' },
];

const ARTICLES: { id: string; category: Category; title: string; summary: string; readMin: number }[] = [
  { id: '1', category: 'general',    title: 'Дадал хэрхэн бүрддэг вэ?',               summary: 'Дадал бүрдэх гурван шатыг мэдэж авсанаар амьдралаа илүү үр дүнтэй удирдах боломжтой.',                   readMin: 5 },
  { id: '2', category: 'general',    title: 'Жижиг алхамаар том өөрчлөлт',             summary: 'Маш жижиг зүйлээс эхэлж, аажмаар нарийсгах нь дадал бүрдүүлэх шилдэг стратеги юм.',                      readMin: 4 },
  { id: '3', category: 'creativity', title: 'Бүтээлч байдлаа хэвшүүлэх нь',            summary: 'Өдөр бүр бичих, зурах, хийх гэсэн бүтээлч хэвшил нь уураг тархины холбоог бэхжүүлнэ.',                  readMin: 6 },
  { id: '4', category: 'creativity', title: 'Урам хүсэл (мотиваци) ба бүтээлч байдал', summary: 'Мотиваци нь тогтворгүй, харин зохион байгуулалттай дадал нь тогтвортой бүтээлч байдлыг дагуулна.',       readMin: 5 },
  { id: '5', category: 'health',     title: 'Унтлагын дадал — эрүүл мэндийн суурь',    summary: 'Сайн унтлагын хэвшил нь бие, сэтгэлийн аль алинд нь эерэг нөлөөтэй.',                                   readMin: 4 },
  { id: '6', category: 'health',     title: 'Усны хэрэглээг хэвшүүлэх нь',             summary: 'Сануулга тохируулж, өөрийн хэмжээг тодорхойлсноор усны хэрэглээгээ хялбар хэвшүүлнэ.',                  readMin: 3 },
  { id: '7', category: 'mindset',    title: 'Бүтэлгүйтлийг хэрхэн даван туулах вэ',    summary: 'Нэг өдрийн алдаа таны дадлыг сүйтгэхгүй — чухал нь дараа өдөр нь үргэлжлүүлэх явдал.',                readMin: 4 },
  { id: '8', category: 'mindset',    title: 'Өөрийгөө шинжлэх (self-reflection)',      summary: 'Өөрийн дадлын явцад тусгал хийх нь бие даасан байдлыг хурдасгадаг.',                                     readMin: 5 },
];

function ArticleCard({ title, summary, readMin, color, delay }: {
  title: string; summary: string; readMin: number; color: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-[18px] p-4 bg-card"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }} className="text-foreground">{title}</p>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(0,0,0,0.52)' }}>{summary}</p>
          <div className="flex items-center gap-1.5 mt-3">
            <Clock className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.3)' }} />
            <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', fontWeight: 500 }}>{readMin} мин уншилт</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + '18' }}>
          <ChevronRight className="w-4 h-4" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

export function LearnPage() {
  const [active, setActive] = useState<Category>('general');
  const filtered = ARTICLES.filter(a => a.category === active);
  const activeCat = CATEGORIES.find(c => c.key === active)!;;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 px-5 pt-13 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-primary" />
            <p style={{ fontSize: 18, fontWeight: 600 }} className="text-foreground">Суралцах</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        {/* CATEGORY PILLS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => {
            const isActive = cat.key === active;
            return (
              <motion.button key={cat.key} whileTap={{ scale: 0.95 }}
                onClick={() => setActive(cat.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: isActive ? cat.color + '22' : 'rgba(0,0,0,0.05)',
                  border: isActive ? `1.5px solid ${cat.color}44` : '1.5px solid transparent',
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  color: isActive ? cat.color : 'rgba(0,0,0,0.5)',
                }}>
                <span>{cat.emoji}</span>
                {cat.label}
              </motion.button>
            );
          })}
        </div>

        {/* ARTICLE LIST */}
        <div className="flex flex-col gap-3">
          {filtered.map((article, i) => (
            <ArticleCard key={article.id} {...article} color={activeCat.color} delay={i * 0.05} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p style={{ fontSize: 40 }}>📚</p>
            <p style={{ fontSize: 14, marginTop: 12 }} className="text-muted-foreground">
              Энэ ангилалд нийтлэл байхгүй байна
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
