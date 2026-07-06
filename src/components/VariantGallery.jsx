import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSnapshot } from "valtio";

import state from "../store";
import { SHIRT_VARIANTS } from "../config/generateVariants";
import { preloadMaterialPreviews } from "../config/preloadMaterials";
import { slideAnimation } from "../config/motion";
import VariantMiniCanvas from "./VariantMiniCanvas";

const ITEM_HEIGHT = 84;
const VISIBLE_COUNT = 4;

const VariantCard = ({ variant, isActive, onSelect, scrollRootRef }) => {
  const previewRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = previewRef.current;
    const root = scrollRootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { root, threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollRootRef]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`variant-card ${isActive ? "variant-card-active" : ""}`}
      title={`${variant.materialName} · ${variant.color}`}
    >
      <div ref={previewRef} className="variant-card-preview">
        {isVisible && <VariantMiniCanvas color={variant.color} materialPath={variant.materialPath} />}
      </div>
      <span className="variant-card-label">#{variant.id}</span>
    </button>
  );
};

const VariantGallery = () => {
  const snap = useSnapshot(state);
  const listRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(SHIRT_VARIANTS.length > VISIBLE_COUNT);

  const updateScrollState = () => {
    const list = listRef.current;
    if (!list) return;

    setCanScrollUp(list.scrollTop > 4);
    setCanScrollDown(list.scrollTop + list.clientHeight < list.scrollHeight - 4);
  };

  useEffect(() => {
    preloadMaterialPreviews();
    updateScrollState();
  }, []);

  const scrollByItems = (direction) => {
    listRef.current?.scrollBy({
      top: direction * ITEM_HEIGHT,
      behavior: "smooth",
    });
  };

  const applyVariant = (variant) => {
    state.fabricColor = variant.color;
    state.shirtMaterial = variant.materialPath;
    state.color = variant.color;
  };

  const isVariantActive = (variant) =>
    snap.shirtMaterial === variant.materialPath &&
    snap.fabricColor.toLowerCase() === variant.color.toLowerCase();

  return (
    <motion.div key="variants" className="variant-gallery" {...slideAnimation("right")}>
      <p className="variant-gallery-title">Варианты</p>

      <button
        type="button"
        className="variant-gallery-arrow"
        onClick={() => scrollByItems(-1)}
        disabled={!canScrollUp}
        aria-label="Прокрутить вверх"
      >
        ▲
      </button>

      <div ref={listRef} className="variant-gallery-list" onScroll={updateScrollState}>
        {SHIRT_VARIANTS.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            isActive={isVariantActive(variant)}
            onSelect={() => applyVariant(variant)}
            scrollRootRef={listRef}
          />
        ))}
      </div>

      <button
        type="button"
        className="variant-gallery-arrow"
        onClick={() => scrollByItems(1)}
        disabled={!canScrollDown}
        aria-label="Прокрутить вниз"
      >
        ▼
      </button>
    </motion.div>
  );
};

export default VariantGallery;
