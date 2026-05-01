import { motion } from 'motion/react';
import { buttonStyles } from '@/shared/design';
import type { LearningTopic } from '../content/learning-topics';

interface Props {
  topics: LearningTopic[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function TopicChips({ topics, activeId, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
      {topics.map((topic) => {
        const active = topic.id === activeId;
        return (
          <motion.button
            key={topic.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(topic.id)}
            className={`shrink-0 ${buttonStyles({ variant: active ? 'default' : 'secondary', size: 'sm' })}`}
            style={{
              backgroundColor: active ? '#303437' : 'var(--surface-subtle)',
              color: active ? '#fff' : 'var(--text-soft)',
              fontWeight: active ? 600 : 400,
              fontSize: 12,
              boxShadow: 'none',
            }}
          >
            {topic.label}
          </motion.button>
        );
      })}
    </div>
  );
}
