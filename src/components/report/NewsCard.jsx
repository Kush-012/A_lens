// components/report/NewsCard.jsx
// Light theme news list.

import { motion } from "framer-motion";
import { Newspaper, ExternalLink } from "lucide-react";

function NewsItem({ item }) {
  if (!item) return null;
  const isString = typeof item === "string";
  const title = isString ? item : item.headline || item.title;
  const url   = isString ? null : item.url || item.link;
  const date  = isString ? null : item.date || item.publishedAt;
  const src   = isString ? null : item.source;

  return (
    <div className="py-3 border-b border-gray-100 last:border-0 group">
      <div className="flex items-start gap-3">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-[13.5px] font-medium text-gray-900 hover:text-primary transition-colors leading-snug"
          >
            {title}
          </a>
        ) : (
          <span className="flex-1 text-[13.5px] font-medium text-gray-900 leading-snug">
            {title}
          </span>
        )}
        {url && (
          <ExternalLink size={14} className="text-gray-300 group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
        )}
      </div>
      {(src || date) && (
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500 font-medium">
          {src && <span className="uppercase tracking-wider">{src}</span>}
          {src && date && <span>·</span>}
          {date && <span>{new Date(date).toLocaleDateString()}</span>}
        </div>
      )}
    </div>
  );
}

export default function NewsCard({ news }) {
  if (!news || news.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 mb-3 ml-1 flex items-center gap-1.5">
        <Newspaper size={13} />
        Recent News
      </p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="card px-5 py-2"
      >
        {news.slice(0, 5).map((item, i) => (
          <NewsItem key={i} item={item} />
        ))}
      </motion.div>
    </div>
  );
}
