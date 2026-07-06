import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";

import config from "../config/config";
import state from "../store";
import { download } from "../assets";
import { downloadCanvasToImage, reader, takeFrontBackScreenshots } from "../config/helpers";
import { EditorTabs, FilterTabs, DecalTypes } from "../config/constants";
import { fadeAnimation, slideAnimation } from "../config/motion";
import { AIPicker, ColorPicker, CustomButton, FilePicker, ImageOverlayPicker, LogoColorPicker, BackNumberColorPicker, MaterialPicker, Tab, VariantGallery } from "../components";
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

  useEffect(() => {
    preloadMaterialPreviews();
  }, []);

  // show tab content depending on the activeTab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />;
      case "materialpicker":
        return <MaterialPicker />;
      case "imageoverlay":
        return <ImageOverlayPicker />;
      case "logocolorpicker":
        return <LogoColorPicker />;
      case "backnumberpicker":
        return <BackNumberColorPicker />;
      case "filepicker":
        return <FilePicker file={file} setFile={setFile} readFile={readFile} />;
      case "aipicker":
        return <AIPicker prompt={prompt} setPrompt={setPrompt} generatingImg={generatingImg} handleSubmit={handleSubmit} />;
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

    // after setting the state, activeFilterTab is updated

    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName],
      };
    });
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

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div key="custom" className="absolute top-0 left-0 z-10" {...slideAnimation("left")}>
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    isActiveTab={activeEditorTab === tab.name}
                    handleClick={() => setActiveEditorTab((prev) => (prev === tab.name ? "" : tab.name))}
                    onMouseEnter={tab.name === "materialpicker" || tab.name === "variantgallery" ? preloadMaterialPreviews : undefined}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          {activeEditorTab === "variantgallery" && <VariantGallery />}

          <motion.div className="filtertabs-container" {...slideAnimation("up")}>
            <button type="button" onClick={() => (state.isPainting = !state.isPainting)} className={`py-2.5 px-5 rounded-full text-sm font-semibold transition-colors glassmorphism bg-blue-500 ${snap.isPainting ? "bg-blue-500" : "text-gray-700"}`}>
              {snap.isPainting ? "Рисование: ВКЛ" : "Рисование: ВЫКЛ"}
            </button>
            <button type="button" onClick={handleScreenshot} disabled={isTakingScreenshot} className="py-2.5 px-5 rounded-full text-sm font-semibold transition-colors glassmorphism text-gray-700 disabled:opacity-50 text">
              {isTakingScreenshot ? "Сохранение..." : "Сделать скриншот"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;
