import React from 'react';
import {useSnapshot} from 'valtio';

import state from '../store';




const Tab = ({ tab, isFilterTab, isActiveTab, handleClick, onMouseEnter }) => {
  const snap = useSnapshot(state);
  const activeStyles =
    isFilterTab && isActiveTab
      ? { backgroundColor: snap.color, opacity: 0.5 }
      : !isFilterTab && isActiveTab
        ? { backgroundColor: "rgba(255,255,255,0.35)", opacity: 1 }
        : { backgroundColor: "transparent", opacity: 1 };

  return (
    <div
      key={tab.name}
      className={`tab-btn rounded-4 ${!isFilterTab && isActiveTab ? "ring-2 ring-blue-400" : ""}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      style={activeStyles}
    >
      <img 
      src={tab.icon}
      alt={tab.name}
      className={`${isFilterTab ? 'w-2/3 h-2/3' : 'w-11/12 h-11/12 object-contain'}`}
       />

    </div>
  )
}

export default Tab