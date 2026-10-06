import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";

import state from "../store";
import { reader, takeFrontBackScreenshots } from "../config/helpers";
import { EditorTabs, DecalTypes } from "../config/constants";
import { slideAnimation } from "../config/motion";
import { AIPicker, ColorPicker, FilePicker, ImageOverlayPicker, BackNumberColorPicker, MaterialPicker, Tab, TeamPalettePicker, VariantGallery } from "../components";
import { preloadMaterialPreviews } from "../config/preloadMaterials";

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatingImg, setGeneratingImg] = useState(false);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  });

  const handleDownloadGlb = () => {
    if (snap.isExportingGlb) return;
    state.downloadGlbSignal += 1;
  };

  useEffect(() => {
    preloadMaterialPreviews();
  }, []);

  const closeEditorTab = () => setActiveEditorTab("");

  const toggleEditorTab = (name) => {
    setActiveEditorTab((prev) => (prev === name ? "" : name));
  };

  const generateTabContent = (tabName) => {
    switch (tabName) {
      case "colorpicker":
        return <ColorPicker onClose={closeEditorTab} />;
      case "materialpicker":
        return <MaterialPicker onClose={closeEditorTab} />;
      case "imageoverlay":
        return <ImageOverlayPicker onClose={closeEditorTab} />;
      case "backnumberpicker":
        return <BackNumberColorPicker onClose={closeEditorTab} />;
      case "filepicker":
        return <FilePicker file={file} setFile={setFile} readFile={readFile} />;
      case "aipicker":
        return <AIPicker prompt={prompt} setPrompt={setPrompt} generatingImg={generatingImg} handleSubmit={handleSubmit} />;
      case "variantgallery":
        return <VariantGallery />;
      default:
        return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert("Please enter a prompt");

    try {
      setGeneratingImg(true);

      const response = await fetch("http://localhost:8080/api/v1/dalle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      handleDecals(type, `data:image/png;base64,${data.photo}`);
    } catch (error) {
      alert(error);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  };

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    setActiveFilterTab((prevState) => ({
      ...prevState,
      [tabName]: !prevState[tabName],
    }));
  };

  const readFile = (type) => {
    reader(file).then((result) => {
      handleDecals(type, result);
      setActiveEditorTab("");
    });
  };

  const handleScreenshot = async () => {
    if (isTakingScreenshot) return;
    setIsTakingScreenshot(true);
    try {
      await takeFrontBackScreenshots();
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  const showPanelBackdrop = Boolean(activeEditorTab);

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          {showPanelBackdrop && <button type="button" className="picker-backdrop md:hidden" aria-label="Закрыть панель" onClick={closeEditorTab} />}

          <motion.div key="custom" className="editortabs-shell" {...slideAnimation("left")}>
            <div className="editortabs-container tabs">
              {EditorTabs.map((tab) => (
                <div key={tab.name} className={`editortab-item ${activeEditorTab === tab.name ? "is-open" : ""}`}>
                  <Tab
                    tab={tab}
                    isActiveTab={activeEditorTab === tab.name}
                    handleClick={() => toggleEditorTab(tab.name)}
                    onMouseEnter={tab.name === "materialpicker" || tab.name === "variantgallery" ? preloadMaterialPreviews : undefined}
                  />
                  {activeEditorTab === tab.name && generateTabContent(tab.name)}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="bottom-dock" {...slideAnimation("up")}>
            <TeamPalettePicker />

            <div className="filtertabs-container">
              <button type="button" onClick={() => (state.isPainting = !state.isPainting)} className={`action-chip ${snap.isPainting ? "action-chip-active" : ""}`} data-tooltip={snap.isPainting ? "Выключить рисование" : "Включить рисование кистью"}>
                {snap.isPainting ? "Кисть: ВКЛ" : "Кисть"}
              </button>
              <button
                type="button"
                onClick={() => {
                  state.downloadUvIncludeTexture = true;
                  state.downloadUvSignal += 1;
                }}
                className="action-chip"
                data-tooltip="Скачать UV-развёртку с текстурой"
              >
                UV
              </button>
              <button
                type="button"
                onClick={() => {
                  state.downloadUvIncludeTexture = false;
                  state.downloadUvSignal += 1;
                }}
                className="action-chip"
                data-tooltip="Скачать UV-развёртку без текстуры"
              >
                UV−
              </button>
              <button type="button" onClick={handleScreenshot} disabled={isTakingScreenshot} className="action-chip" data-tooltip="Сделать скриншот спереди и сзади">
                {isTakingScreenshot ? "..." : "Скрин"}
              </button>
              <button type="button" onClick={handleDownloadGlb} disabled={snap.isExportingGlb} className="action-chip" data-tooltip="Скачать 3D-модель (GLB)">
                {snap.isExportingGlb ? "..." : "3D"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;
