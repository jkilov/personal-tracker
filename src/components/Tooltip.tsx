import { useState } from "react";
import { IoInformationCircle } from "react-icons/io5";
import "./Tooltip.css";

import { useRef } from "react";

interface Props {
  children: React.ReactNode;
}

const Tooltip = ({ children }: Props) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef<HTMLDialogElement | null>(null);

  const showTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.show();
    }
    setIsTooltipVisible(true);
  };

  const hideTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.close();
    setIsTooltipVisible(false);
  };

  return (
    <div onMouseLeave={hideTooltip} className="tooltip">
      <IoInformationCircle
        onMouseEnter={showTooltip}
        className={isTooltipVisible ? "hide-tooltip-symbol" : undefined}
      />
      <dialog className="tooltip-container" ref={tooltipRef}>
        {children}
      </dialog>
    </div>
  );
};

export default Tooltip;
