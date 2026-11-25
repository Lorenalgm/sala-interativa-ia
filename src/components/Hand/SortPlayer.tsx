import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { SortItem, SortPack } from '../../data/handActivities';
import { Homography, Point } from '../../services/homography';
import { EMPTY_INPUT, HandCursor, HandInput, HandSource } from './handInput';
import { Footer, ProjectionShell, Rect, TopBar, celebrate, inRect, rectStyle } from './projection';

interface SortPlayerProps {
  pack: SortPack;
  homography: Homography | null;
  onExit: () => void;
  onCameraStatusChange?: (active: boolean) => void;
}

const AREA_X = 0.03;
const AREA_W = 0.94;
const GAP = 0.02;
const CARDS_Y = 0.2;
const CARD_H = 0.15;
const BINS_Y = 0.57;
const BINS_H = 0.37;
const AIM_MS = 700; // ao fechar os dedos a palma escorrega: vale o cartão mirado logo antes
const RELEASE_LOOKBACK_MS = 150; // ao abrir os dedos também: solta onde a mão estava um instante antes
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5, -1, 2.5, -2, 1];

// Lugar de cada cartão na mesa: até 4 numa fileira, senão duas fileiras
function layoutCards(n: number): Rect[] {
  const cols = n <= 4 ? n : Math.ceil(n / 2);
  const w = Math.min(0.2, (AREA_W - GAP * (cols - 1)) / cols);
  const rowW = cols * w + (cols - 1) * GAP;
  const left = AREA_X + (AREA_W - rowW) / 2;
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    // A segunda fileira, se tiver menos cartões, fica centralizada
    const inRow = row === 0 ? Math.min(cols, n) : n - cols;
    const rowLeft = left + ((cols - inRow) * (w + GAP)) / 2;
    return { x: rowLeft + col * (w + GAP), y: CARDS_Y + row * (CARD_H + 0.03), w, h: CARD_H };
  });
}

function layoutBins(k: number): Rect[] {
  const w = (AREA_W - GAP * (k - 1)) / k;
  return Array.from({ length: k }, (_, i) => ({ x: AREA_X + i * (w + GAP), y: BINS_Y, w, h: BINS_H }));
}

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Flash = { bin: string; kind: 'right' | 'wrong'; item: string } | null;

// "Classificar em grupos": a turma pinça cada cartão e solta na caixa certa
export const SortPlayer: React.FC<SortPlayerProps> = ({ pack, homography, onExit, onCameraStatusChange }) => {
  const [round, setRound] = useState(0); // muda a cada "jogar de novo" e reembaralha
  const items = useMemo(() => shuffle(pack.items), [pack, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const cards = useMemo(() => layoutCards(items.length), [items.length]);
  const bins = useMemo(() => layoutBins(pack.categories.length), [pack.categories.length]);

  const [input, setInput] = useState<HandInput>(EMPTY_INPUT);
  const [status, setStatus] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string[]>([]); // ids na ordem em que entraram
  const [misses, setMisses] = useState<Record<string, number>>({});
  const [drag, setDrag] = useState<{ id: string; pos: Point } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [done, setDone] = useState(false);

  const dragRef = useRef<string | null>(null);
  const wasClosed = useRef(false);
  const aim = useRef<{ id: string; at: number } | null>(null);
  const history = useRef<{ t: number; p: Point }[]>([]);
  const flashTimer = useRef<number | null>(null);
  const placedRef = useRef(placed);
  placedRef.current = placed;

  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
  }, []);

  const itemById = (id: string) => items.find((i) => i.id === id) as SortItem;

  // Cartão sob a mão: entre os que ainda estão na mesa, o de centro mais perto
  const cardAt = (p: Point): string | null => {
    let best: { id: string; d: number } | null = null;
    items.forEach((item, i) => {
      if (placedRef.current.includes(item.id)) return;
      const r = cards[i];
      if (!inRect(r, p, 0.015)) return;
      const d = Math.hypot(p.x - (r.x + r.w / 2), p.y - (r.y + r.h / 2));
      if (!best || d < best.d) best = { id: item.id, d };
    });
    return best ? (best as { id: string }).id : null;
  };

  const showFlash = (f: Flash) => {
    setFlash(f);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    // O aviso de erro fica mais tempo: a turma precisa ler
    flashTimer.current = window.setTimeout(() => setFlash(null), f?.kind === 'wrong' ? 1800 : 900);
  };

  const drop = (id: string, p: Point | null) => {
    dragRef.current = null;
    setDrag(null);
    if (!p) return; // a mão sumiu: o cartão volta para a mesa
    const binIndex = bins.findIndex((b) => inRect(b, p, 0.01));
    if (binIndex < 0) return;
    const category = pack.categories[binIndex];
    const item = itemById(id);
    if (item.category === category.id) {
      const next = [...placedRef.current, id];
      setPlaced(next);
      showFlash({ bin: category.id, kind: 'right', item: id });
      const b = bins[binIndex];
      celebrate({ x: b.x + b.w / 2, y: b.y + 0.05 }, 30);
      if (next.length === items.length) window.setTimeout(() => setDone(true), 1100);
    } else {
      setMisses((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
      showFlash({ bin: category.id, kind: 'wrong', item: id });
    }
  };

  const onInput = (inp: HandInput, now: number) => {
    setInput(inp);
    if (done) return;
    if (inp.pos) history.current = [...history.current.filter((h) => now - h.t <= 400), { t: now, p: inp.pos }];
    const rising = inp.closed && !wasClosed.current;
    wasClosed.current = inp.closed;

    if (!dragRef.current) {
      const hovered = inp.pos ? cardAt(inp.pos) : null;
      if (!inp.closed && hovered) aim.current = { id: hovered, at: now };
      setHover(hovered);
      if (rising && inp.pos) {
        const target = hovered ?? (aim.current && now - aim.current.at <= AIM_MS ? aim.current.id : null);
        if (target && !placedRef.current.includes(target)) {
          dragRef.current = target;
          setDrag({ id: target, pos: inp.pos });
          setHover(null);
        }
      }
      return;
    }

    const id = dragRef.current;
    if (inp.closed && inp.pos) {
      setDrag({ id, pos: inp.pos });
      return;
    }
    if (!inp.closed) {
      if (!inp.pos) return drop(id, null);
      const before = history.current.filter((h) => now - h.t >= RELEASE_LOOKBACK_MS).pop();
      drop(id, before ? before.p : inp.pos);
    }
  };

  const undo = () => {
    if (drag || placed.length === 0) return;
    setPlaced(placed.slice(0, -1));
    setDone(false);
  };

  const restart = () => {
    setPlaced([]);
    setMisses({});
    setDone(false);
    setDrag(null);
    dragRef.current = null;
    setRound((r) => r + 1);
  };

  const binUnder = drag ? bins.findIndex((b) => inRect(b, drag.pos, 0.01)) : -1;

  if (done) {
    return (
      <ProjectionShell onExit={onExit} onKey={(k) => k === 'r' && restart()}>
        <SortSummary pack={pack} misses={misses} onRestart={restart} onExit={onExit} />
      </ProjectionShell>
    );
  }

  return (
    <ProjectionShell onExit={onExit} onKey={(k) => (k === 'z' ? undo() : k === 'r' ? restart() : undefined)}>
      <HandSource homography={homography} onInput={onInput} onStatus={(s) => setStatus(s.message)} onCameraStatusChange={onCameraStatusChange} />

      <TopBar title={pack.title} emoji={pack.emoji} right={`${placed.length} de ${items.length} no lugar`} />

      <h1 className="absolute left-[3%] right-[3%] top-[8%] h-[10%] flex items-center justify-center text-center font-display font-bold text-[3.4vw] leading-none tracking-tight">
        {pack.prompt}
      </h1>

      {/* Caixas */}
      {pack.categories.map((c, i) => {
        const isFlash = flash?.bin === c.id;
        const target = binUnder === i;
        const inside = placed.map(itemById).filter((it) => it.category === c.id);
        return (
          <div
            key={`${c.id}-${isFlash && flash?.kind === 'wrong' ? flash.item + placed.length + (misses[flash.item] ?? 0) : 'ok'}`}
            className={`absolute rounded-[1.6vw] border-[0.35vw] flex flex-col overflow-hidden transition-transform ${
              isFlash && flash?.kind === 'wrong' ? 'shake' : ''
            } ${target ? 'scale-[1.02]' : ''}`}
            style={{
              ...rectStyle(bins[i]),
              borderColor: isFlash && flash?.kind === 'wrong' ? '#d70015' : c.color,
              background: isFlash ? (flash?.kind === 'right' ? '#dcfce7' : '#fee2e2') : target ? c.tint : '#ffffff',
              boxShadow: target ? `0 0 0 0.5vw ${c.color}33` : undefined,
            }}
          >
            <div className="px-[1.6vw] py-[1vw] flex items-center justify-between gap-2" style={{ background: c.color }}>
              <span className="font-display font-bold text-[2.8vw] leading-none text-white">{c.name}</span>
              <span className="text-[1.6vw] font-bold text-white/85 tabular-nums">{inside.length}</span>
            </div>
            <div className="flex-1 p-[1vw] flex flex-wrap content-start gap-[0.7vw]">
              {inside.map((it) => (
                <span key={it.id} className="pop-in inline-flex items-center gap-[0.5vw] rounded-full bg-white border-[0.15vw] px-[1.1vw] py-[0.35vw] text-[2vw] font-semibold" style={{ borderColor: c.color }}>
                  {it.emoji && <span aria-hidden="true">{it.emoji}</span>}
                  {it.text}
                </span>
              ))}
              {isFlash && flash?.kind === 'wrong' && (
                <span className="w-full text-center text-[2vw] font-bold text-[#a3001a] mt-[1vw]">
                  {itemById(flash.item).text} não é {c.name.toLowerCase()}. Tente outra caixa!
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Cartões na mesa (o que está na mão é desenhado por último, por cima) */}
      {items.map((item, i) => {
        if (placed.includes(item.id) || drag?.id === item.id) return null;
        return <Card key={`${round}-${item.id}`} item={item} rect={cards[i]} tilt={TILTS[i % TILTS.length]} hovered={hover === item.id} />;
      })}
      {drag && (() => {
        const i = items.findIndex((it) => it.id === drag.id);
        const r = cards[i];
        return (
          <Card
            item={items[i]}
            rect={{ x: drag.pos.x - r.w / 2, y: drag.pos.y - r.h / 2, w: r.w, h: r.h }}
            tilt={0}
            lifted
          />
        );
      })()}

      <HandCursor input={input} />

      <Footer
        status={status ?? (homography ? null : 'Teste com o mouse: aperte o botão para pegar e solte na caixa')}
        hints="Pinça para pegar, abra a mão para soltar · Z: desfaz · R: recomeça · Esc: sair"
      />
    </ProjectionShell>
  );
};

const Card: React.FC<{ item: SortItem; rect: Rect; tilt: number; hovered?: boolean; lifted?: boolean }> = ({
  item,
  rect,
  tilt,
  hovered,
  lifted,
}) => (
  <div
    className={`absolute rounded-[1.2vw] bg-white border-[0.2vw] flex items-center justify-center gap-[1vw] px-[1vw] ${
      lifted ? 'z-20 border-primary shadow-[0_2vw_3vw_-1vw_rgb(0_0_0/0.45)]' : 'card-home border-zinc-300 shadow-[0_0.6vw_1.2vw_-0.6vw_rgb(0_0_0/0.3)]'
    } ${hovered ? 'border-primary' : ''}`}
    style={{
      ...rectStyle(rect),
      transform: `rotate(${tilt}deg) scale(${lifted ? 1.08 : hovered ? 1.05 : 1})`,
    }}
  >
    {item.emoji && (
      <span className="text-[4vw] leading-none" aria-hidden="true">
        {item.emoji}
      </span>
    )}
    <span className={`font-display font-bold leading-tight text-center ${item.emoji ? 'text-[2vw]' : 'text-[3.4vw]'}`}>{item.text}</span>
  </div>
);

const SortSummary: React.FC<{
  pack: SortPack;
  misses: Record<string, number>;
  onRestart: () => void;
  onExit: () => void;
}> = ({ pack, misses, onRestart, onExit }) => {
  const firstTry = pack.items.filter((i) => !misses[i.id]).length;
  const tricky = pack.items.filter((i) => misses[i.id]);
  useEffect(() => {
    celebrate({ x: 0.5, y: 0.3 }, 140);
  }, []);
  const nameOf = (id: string) => pack.categories.find((c) => c.id === id)?.name ?? '';
  return (
    <div className="absolute inset-0 px-[5%] py-[4%] flex flex-col gap-[2.5vw]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[1.7vw] font-bold text-zinc-500">
            {pack.emoji} {pack.title}
          </p>
          <h1 className="font-display font-bold text-[4.4vw] leading-none tracking-tight mt-[0.6vw]">Tudo no lugar! 🎉</h1>
        </div>
        <div className="flex gap-[1vw]">
          <button onClick={onExit} className="inline-flex items-center gap-[0.6vw] rounded-full bg-zinc-200 px-[1.8vw] py-[0.9vw] text-[1.5vw] font-semibold">
            <Undo2 className="w-[1.5vw] h-[1.5vw]" aria-hidden="true" />
            Outra atividade
          </button>
          <button onClick={onRestart} className="inline-flex items-center gap-[0.6vw] rounded-full bg-primary text-white px-[1.8vw] py-[0.9vw] text-[1.5vw] font-semibold">
            <RotateCcw className="w-[1.5vw] h-[1.5vw]" aria-hidden="true" />
            Jogar de novo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[1.5vw]">
        <div className="rounded-[1.4vw] py-[1.6vw] text-center bg-[#e8f5ec] text-[#14532d]">
          <p className="font-display font-bold text-[5.5vw] leading-none tabular-nums">
            {firstTry}
            <span className="text-[2.6vw]"> de {pack.items.length}</span>
          </p>
          <p className="text-[1.8vw] font-semibold mt-[0.6vw]">de primeira</p>
        </div>
        <div className="rounded-[1.4vw] py-[1.6vw] text-center bg-amber-100 text-amber-950">
          <p className="font-display font-bold text-[5.5vw] leading-none tabular-nums">{tricky.length}</p>
          <p className="text-[1.8vw] font-semibold mt-[0.6vw]">precisaram de outra tentativa</p>
        </div>
      </div>

      {tricky.length > 0 ? (
        <section className="space-y-[0.8vw]">
          <h2 className="text-[1.6vw] font-bold uppercase tracking-wide text-zinc-500">Vale conversar sobre</h2>
          <ul className="flex flex-wrap gap-[1vw]">
            {tricky.map((i) => (
              <li key={i.id} className="rounded-[1vw] border-[0.15vw] border-zinc-200 px-[1.4vw] py-[0.8vw] text-[1.9vw] font-semibold">
                {i.emoji} {i.text} <span className="text-zinc-500 font-normal">é</span> {nameOf(i.category)}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-[2.2vw] font-semibold text-zinc-700">A turma acertou todos de primeira.</p>
      )}
    </div>
  );
};
