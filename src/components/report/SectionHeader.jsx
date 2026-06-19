import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import SectionIconAnimated from '@/components/report/SectionIconAnimated';
import EfragReference from '@/components/report/EfragReference';

function HeaderCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      // lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(134,239,172,${0.15 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // dots
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(134,239,172,0.35)';
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

export default function SectionHeader({ icon, sectionId, title, description, reference }) {
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 p-7 text-white mb-6"
    >
      {/* Animated network canvas */}
      <HeaderCanvas />

      {/* Soft glow blobs */}
      <div className="absolute -top-10 -right-10 w-52 h-52 bg-green-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-emerald-300/6 rounded-full blur-2xl pointer-events-none" />

      {/* Orbiting ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-8 -top-8 w-40 h-40 opacity-[0.07] pointer-events-none"
      >
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="8 4" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 18 }}
          className="shrink-0 drop-shadow-lg select-none"
        >
          {sectionId ? (
            <SectionIconAnimated sectionId={sectionId} />
          ) : typeof icon === 'string' && icon.startsWith('http') ? (
            <img src={icon} alt="" className="w-14 h-14 object-contain rounded-xl" />
          ) : (
            <span className="text-4xl">{icon}</span>
          )}
        </motion.div>
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="font-heading text-xl font-extrabold mb-1.5"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-[13px] text-white/65 leading-relaxed max-w-xl"
          >
            {description}
          </motion.p>
          {reference && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-green-300/80 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1"
            >
              📋 {reference}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
    <EfragReference reference={reference} />
    </>
  );
}