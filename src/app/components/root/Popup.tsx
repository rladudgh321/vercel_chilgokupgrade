'use client';

import { use, useState } from 'react';
import DraggablePopup from './DraggablePopup';

export type PopupPost = {
  id: number;
  representativeImage: string | null;
  popupWidth: number | null;
  popupHeight: number | null;
  popupType?: 'IMAGE' | 'CONTENT';
  popupContent?: string | null;
};

const Popup = ({ popups }: { popups: Promise<PopupPost[]> }) => {
  const popupsPromise = use(popups);
  // z-index management
  const [stackOrder, setStackOrder] = useState<number[]>(popupsPromise.map(p => p.id));

  const handleFocus = (id: number) => {
    setStackOrder(currentOrder => {
      const newOrder = currentOrder.filter(i => i !== id);
      newOrder.push(id);
      return newOrder;
    });
  };

  return (
    <>
      {popupsPromise.map((popup, index) => (
        <DraggablePopup 
          key={popup.id}
          popup={popup}
          zIndex={stackOrder.indexOf(popup.id) + 1000} // Base z-index of 1000
          onFocus={() => handleFocus(popup.id)}
          initialPosition={{ x: 50 + index * 30, y: 50 + index * 30 }} // Staggered initial positions
        />
      ))}
    </>
  );
};

export default Popup;