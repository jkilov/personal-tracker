import { useState, useEffect } from "react";
import "./SessionCalendar.css";

import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const SessionCalendar = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isCurrentDate, setIsCurrentDate] = useState(true);

  const todayYear = new Date().getFullYear();
  const todayMonth = new Date().getMonth();
  const todaysMonth = new Date().getMonth();
  const selectedMonth = currentDate.getMonth();
  const selectedYear = currentDate.getFullYear();
  const monthAsString = currentDate.toLocaleString("default", {
    month: "long",
  });
  const daysOfMonthCount = new Date(
    currentDate.getFullYear(),
    selectedMonth + 1,
    0
  ).getDate();

  const daysOfMonthArray = Array.from(
    { length: daysOfMonthCount },
    (_, index) => index + 1
  );

  const goBackMonths = () => {
    const month = selectedMonth - 1;
    setCurrentDate(new Date(selectedYear, month, 1, 0, 0, 0, 0));
    setIsCurrentDate(false);
  };

  const goForwardMonths = () => {
    const todayDate = new Date(todayYear, todayMonth, 1, 0, 0, 0, 0);
    const selectedDate = new Date(
      selectedYear,
      selectedMonth + 1,
      1,
      0,
      0,
      0,
      0
    );

    if (todayDate === selectedDate) {
      //FIXME: this line is not printing
      console.log("matches");
      setIsCurrentDate(true);
      return;
    }
    //FIXME: the dates arent lining up even though they look the same. it could be something with the time
    setIsCurrentDate(false);
    const month = selectedMonth + 1;
    setCurrentDate(new Date(selectedYear, month, 1, 0, 0, 0, 0));
    setIsCurrentDate(false);
  };

  return (
    <div>
      <IoIosArrowBack onClick={goBackMonths} />

      <h3>{monthAsString}</h3>
      {!isCurrentDate && <IoIosArrowForward onClick={goForwardMonths} />}
      <div className="calendar">
        {daysOfMonthArray.map((day) => (
          <div key={day} className="day-container">
            <span>{day}</span>

            <div className="day-indicator">
              <div className="day-indicator-inner" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionCalendar;
