import { useState, useEffect } from "react";
import { useParams } from "react-router";

const CurrentSession = () => {
  const [liveTime, setLiveTime] = useState(() => new Date());

  const params = useParams();

  //   useEffect(() => {
  //     const date = new Date();
  //     setTimeout(() => setLiveTime(date), 1000);
  //   }, [liveTime]);

  console.log("P", params);

  return (
    <div>
      <span>{liveTime.getHours()} Time Count Down</span>
    </div>
  );
};

export default CurrentSession;
