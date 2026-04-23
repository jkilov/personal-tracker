import { useState, useEffect } from "react";
import "./SessionCalendar.css";

import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import {
  fetchSessionByDate,
  fetchSessionData,
  type SessionByDate,
} from "../../utils/supabase/session";
import { toast } from "sonner";

const SessionCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isCurrentDate, setIsCurrentDate] = useState(true);
  const [rawSessionDates, setRawSessionDates] = useState<Date[] | null>(null);
  const [chosenSession, setChosenSession] = useState<SessionByDate | null>(
    null
  );

  const todayYear = new Date().getFullYear();
  const todayMonth = new Date().getMonth();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const monthAsString = selectedDate.toLocaleString("default", {
    month: "long",
  });
  const daysOfMonthCount = new Date(
    selectedDate.getFullYear(),
    selectedMonth + 1,
    0
  ).getDate();

  const daysOfMonthArray = Array.from(
    { length: daysOfMonthCount },
    (_, index) => index + 1
  );

  const isSelectedDateExceedsTodayDate = (year: number, month: number) => {
    const selected = new Date(year, month, 1);

    const today = new Date(todayYear, todayMonth, 1);

    return selected >= today;
  };

  const goBackMonths = () => {
    const month = selectedMonth - 1;
    setSelectedDate(new Date(selectedYear, month, 1));
    setIsCurrentDate(false);
  };

  const goForwardMonths = () => {
    const newMonth = selectedMonth + 1;

    setSelectedDate(new Date(selectedYear, newMonth, 1));
    setIsCurrentDate(isSelectedDateExceedsTodayDate(selectedYear, newMonth));
  };

  const trainedDates = (day: number) => {
    if (!rawSessionDates) return;
    const dayOfMonth = day;
    const calendarDate = new Date(selectedYear, selectedMonth, dayOfMonth);
    const calendarDateToString = calendarDate.toDateString();
    const normalizeDate = rawSessionDates?.map((session) =>
      new Date(
        session.getFullYear(),
        session.getMonth(),
        session.getDate()
      ).toDateString()
    );
    return normalizeDate.includes(calendarDateToString);
  };

  const onSelectedSession = async (date: number) => {
    const selectedSession = new Date(selectedYear, selectedMonth, date);
    const selectedSessionToString = selectedSession.toDateString();
    console.log("T", selectedSessionToString);

    const { data, error } = await fetchSessionByDate(selectedSessionToString);
    if (!data) {
      console.error({
        message: error?.message,
        hint: error?.hint,
        details: error?.details,
        cause: error?.cause,
      });
      return;
    }
    setChosenSession(data);
  };

  useEffect(() => {
    const getSessionDates = async () => {
      const { data, error } = await fetchSessionData();
      if (error) {
        console.error({
          message: error.message,
          details: error.details,
          hint: error.hint,
          cause: error.cause,
        });
        toast.error(error.message, {
          style: {
            background: "var(--toast-error)",
          },
        });
      }
      if (data) {
        setRawSessionDates(
          data?.map((session) => new Date(session.session_date))
        );
      }

      // setRawSessionDates(data.map((date) => new Date(date.session_date))); this was working before (populating date)
    };

    getSessionDates();
  }, []);

  console.log("C", chosenSession);

  return (
    <div className="calendar-container ">
      <div className="select-month-navigation">
        <IoIosArrowBack onClick={goBackMonths} />
        <h3>{monthAsString}</h3>
        {!isCurrentDate && <IoIosArrowForward onClick={goForwardMonths} />}
      </div>
      <div className="calendar">
        {daysOfMonthArray.map((day) => (
          <div key={day} className="day-container">
            <span>{day}</span>
            <div className="day-indicator">
              <div
                className={
                  trainedDates(day) ? "day-trained" : "day-indicator-inner"
                }
                onClick={() => onSelectedSession(day)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionCalendar;
