import { IoInformationCircle } from "react-icons/io5";

import { useRef } from "react";

const Tooltip = () => {
  const tooltipRef = useRef<HTMLDialogElement | null>(null);

  const showTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.show();
  };

  const hideTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.close();
  };

  return (
    <div onMouseLeave={hideTooltip}>
      <IoInformationCircle onMouseEnter={showTooltip} />
      <dialog className="tooltip-container" ref={tooltipRef}>
        Tooltip
      </dialog>
    </div>
  );
};

export default Tooltip;
