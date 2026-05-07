import React, { useEffect, useMemo, useRef, useState } from "react";
import { gotrootTutorialMeta, gotrootTutorialStages } from "./data/gotrootTutorialScenario";
import "./gatherImageHero.css";

const coverNameByStageId = {
  customer_reach: "customer-reach",
  customer_discovery: "customer-discovery",
};

function wrapIndex(index, length) {
  return (index + length) % length;
}

function getCircularOffset(index, activeIndex, length) {
  let offset = index - activeIndex;

  if (offset > length / 2) {
    offset -= length;
  }

  if (offset < -length / 2) {
    offset += length;
  }

  return offset;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function GatherImageHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 1440 : window.innerWidth,
    height: typeof window === "undefined" ? 900 : window.innerHeight,
  }));
  const pointerRef = useRef(null);
  const draggedRef = useRef(false);

  const scenarioDeck = useMemo(
    () =>
      gotrootTutorialStages.map((stage, index) => {
        const coverName = coverNameByStageId[stage.id] || stage.id;

        return {
          ...stage,
          albumSide: index < 6 ? "Side A" : "Side B",
          cover: `/assets/gather/covers/${coverName}.webp`,
          leadTechnique: stage.mitre[0]?.split(" ").slice(0, 1).join(" ") || "ATT&CK",
          trackNumber: String(index + 1).padStart(2, "0"),
        };
      }),
    [],
  );

  const activeStage = scenarioDeck[activeIndex];
  const arcConfig = useMemo(() => {
    if (viewport.width <= 540) {
      return {
        radius: clamp(viewport.width * 0.62, 190, 246),
        depth: clamp(viewport.height * 0.1, 56, 84),
        activeLift: -18,
        rotate: 22,
        tilt: 12,
      };
    }

    if (viewport.width <= 820) {
      return {
        radius: clamp(viewport.width * 0.58, 260, 430),
        depth: clamp(viewport.height * 0.12, 82, 112),
        activeLift: -22,
        rotate: 24,
        tilt: 13,
      };
    }

    return {
      radius: clamp(viewport.width * 0.46, 520, 690),
      depth: clamp(viewport.height * 0.17, 120, 170),
      activeLift: -30,
      rotate: 27,
      tilt: 15,
    };
  }, [viewport.height, viewport.width]);

  useEffect(() => {
    function updateViewport() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  function moveActive(delta) {
    setActiveIndex((currentIndex) => wrapIndex(currentIndex + delta, scenarioDeck.length));
  }

  function handlePointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
    };
    draggedRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!pointerRef.current || pointerRef.current.id !== event.pointerId) {
      return;
    }

    const nextDragX = clamp(event.clientX - pointerRef.current.startX, -160, 160);

    if (Math.abs(nextDragX) > 6) {
      draggedRef.current = true;
    }

    setDragX(nextDragX);
  }

  function finishDrag(event) {
    if (!pointerRef.current || pointerRef.current.id !== event.pointerId) {
      return;
    }

    const finalDragX = dragX;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointerRef.current = null;
    setIsDragging(false);
    setDragX(0);

    if (finalDragX <= -46) {
      moveActive(1);
    }

    if (finalDragX >= 46) {
      moveActive(-1);
    }

    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  }

  function handleCardClick(index) {
    if (draggedRef.current) {
      return;
    }

    setActiveIndex(index);
  }

  return (
    <main className="gather-page">
      <section
        className="gather-stage"
        aria-labelledby="gather-title"
        style={{ "--stage-accent": activeStage.color }}
      >
        <nav className="gather-nav" aria-label="Scenario navigation">
          <a className="gather-mark" href="/gather" aria-label="Orion Echo home">
            <span>OE</span>
          </a>
          <div className="gather-actions">
            <button className="gather-nav-link" type="button">
              ATT&CK Map
            </button>
            <button className="gather-login" type="button">
              Enter Lab
            </button>
          </div>
        </nav>

        <div className="gather-noise" aria-hidden="true" />

        <section className="gather-kicker-row" aria-label="Scenario source">
          <span>GOTROOT</span>
          <span>{gotrootTutorialMeta.sourcePath}</span>
          <span>{scenarioDeck.length} tracks</span>
        </section>

        <section className="gather-copy">
          <p className="gather-eyebrow">MITRE ATT&CK APT Scenario Education</p>
          <h1 id="gather-title">Operation Orion Echo</h1>
          <p className="gather-lead">
            앨범을 고르듯 APT 공급망 침해 단계를 넘겨 보며, 안전한 실습 범위 안에서 ATT&CK
            전술과 증거 흐름을 학습합니다.
          </p>
          <div className="gather-cta-row">
            <button className="gather-primary" type="button">
              Open Scenario
            </button>
            <span className="gather-session">Lab-safe emulator</span>
          </div>
        </section>

        <section
          className={["gather-album-deck", isDragging ? "is-dragging" : ""].join(" ")}
          aria-label="APT scenario album selector"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          {scenarioDeck.map((stage, index) => {
            const rawOffset = getCircularOffset(index, activeIndex, scenarioDeck.length);
            const offset = clamp(rawOffset, -5, 5);
            const absoluteOffset = Math.abs(offset);
            const isActive = index === activeIndex;
            const isHidden = Math.abs(rawOffset) > 5;
            const normalizedOffset = clamp(offset / 5, -1, 1);
            const arcAngle = normalizedOffset * Math.PI * 0.5;
            const arcX = Math.sin(arcAngle) * arcConfig.radius;
            const arcY = (1 - Math.cos(arcAngle)) * arcConfig.depth;
            const arcTilt = Math.sin(arcAngle);
            const dragShift = dragX * (1 - Math.min(absoluteOffset, 5) * 0.08);

            return (
              <button
                className={[
                  "gather-album-card",
                  isActive ? "is-active" : "",
                  isHidden ? "is-hidden" : "",
                ].join(" ")}
                key={stage.id}
                type="button"
                aria-pressed={isActive}
                aria-label={`${stage.number}. ${stage.title}`}
                onClick={() => handleCardClick(index)}
                style={{
                  "--offset": offset,
                  "--abs-offset": absoluteOffset,
                  "--card-x": `${arcX}px`,
                  "--drag-shift": `${dragShift}px`,
                  "--card-rotate": `${arcTilt * arcConfig.rotate}deg`,
                  "--card-tilt": `${arcTilt * -arcConfig.tilt}deg`,
                  "--card-scale": Math.max(0.56, 1 - absoluteOffset * 0.09),
                  "--card-y": `${arcY + (isActive ? arcConfig.activeLift : 0)}px`,
                  "--card-opacity": isHidden ? 0 : Math.max(0.2, 1 - absoluteOffset * 0.14),
                  "--card-accent": stage.color,
                  zIndex: 80 - Math.round(absoluteOffset * 9),
                }}
              >
                <span className="gather-vinyl" aria-hidden="true" />
                <img src={stage.cover} alt="" draggable="false" />
                <span className="gather-card-sheen" aria-hidden="true" />
                <span className="gather-card-meta">
                  <span>{stage.number}</span>
                  <strong>{stage.shortTitle}</strong>
                </span>
              </button>
            );
          })}
        </section>

        <aside className="gather-stage-panel" aria-live="polite">
          <p className="gather-album-side">{activeStage.albumSide}</p>
          <h2>{activeStage.title}</h2>
          <p>{activeStage.objective}</p>
          <div className="gather-tags" aria-label="Active scenario details">
            <span>{activeStage.leadTechnique}</span>
            <span>{activeStage.gate.mode}</span>
            <span>{activeStage.location}</span>
          </div>
        </aside>

        <button className="gather-step gather-prev" type="button" aria-label="Previous scenario" onClick={() => moveActive(-1)}>
          <span />
        </button>
        <button className="gather-step gather-next" type="button" aria-label="Next scenario" onClick={() => moveActive(1)}>
          <span />
        </button>

        <section className="gather-track-strip" aria-label="Scenario track list">
          {scenarioDeck.map((stage, index) => (
            <button
              className={index === activeIndex ? "is-active" : ""}
              key={stage.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              style={{ "--track-accent": stage.color }}
            >
              <span>{stage.trackNumber}</span>
              <strong>{stage.shortTitle}</strong>
            </button>
          ))}
        </section>

        <button className="gather-scan" type="button" aria-label="Open scenario intelligence">
          <span />
          <span />
          <span />
          <span />
        </button>
      </section>
    </main>
  );
}
