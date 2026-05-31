import { useState, useEffect } from "react";
import "./SessionCalendar.css";
import clsx from "clsx";
import { OrbitProgress } from "react-loading-indicators";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import {
  fetchSessionByDate,
  fetchSessionData,
} from "../../utils/supabase/session";
import { toast } from "sonner";
import SessionCard from "../SessionCard/SessionCard";

type Exercise = {
  exercise_name: string;
  body_part: string;
};

type Sets = {
  reps: number;
  weight: number;
  exercise_id: number;
  set_number: number;
  exercise: Exercise[];
};

type SessionByDate = {
  session_date: string;
  session_id: string;
  sets: Sets[];
};

const SessionCalendar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isCurrentDate, setIsCurrentDate] = useState(true);
  const [rawSessionDates, setRawSessionDates] = useState<Date[] | null>(null);
  const [chosenSession, setChosenSession] = useState<SessionByDate | null>(
    null
  );
  const [daySelected, setDaySelected] = useState<number | null>(null);

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
    if (!rawSessionDates) return false;
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
    //TODO: confirm if we need to do the above since will be stringified due to JSON passing over network to supabase
    return normalizeDate.includes(calendarDateToString);
  };

  const onSelectedSession = async (date: number) => {
    setIsLoading(true);
    setDaySelected(date);
    const selectedSession = new Date(selectedYear, selectedMonth, date);
    const selectedSessionToString = selectedSession.toDateString();

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
    setIsLoading(false);

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
    };

    getSessionDates();
  }, []);

  return (
    <div className="calendar-container ">
      <div className="calendar-contents">
        <div>
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
                    className={clsx(
                      "day-indicator-inner",
                      trainedDates(day) && "day-trained",
                      daySelected === day && "selected"
                    )}
                    onClick={() => onSelectedSession(day)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="session-card-slot">
        {isLoading && (
          <OrbitProgress color="#7CEA9C" size="medium" text="" textColor="" />
        )}
        {!isLoading && chosenSession && (
          <SessionCard sessionId={chosenSession.session_id} />
        )}
      </div>
    </div>
  );
};

export default SessionCalendar;
