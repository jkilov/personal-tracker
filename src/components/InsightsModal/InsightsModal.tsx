import "./InsightsModal.css";
import { useState, useEffect } from "react";

import { retrieveSession } from "../../utils/supabase/auth-supabase";
import Tooltip from "../Tooltip";
import { TrophySpin } from "react-loading-indicators";
import { PiCursorClick } from "react-icons/pi";

interface Props {
  sessionId: string;
  isInsightsViewable: boolean;
  onClose: () => void;
}

const InsightsModal = ({ sessionId, onClose }: Props) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const getInsights = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    const data = await fetch(
      `https://sudaxmkqsdilkjylccqu.supabase.co/functions/v1/get-ai-session-recommendations/${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const response = await data.json();
    setAiInsight(response.message);
    setIsLoading(false);
  };

  useEffect(() => {
    const retrieveAccessToken = async () => {
      const { data, error } = await retrieveSession();

      if (error) return;

      setAccessToken(data.session?.access_token);
    };

    retrieveAccessToken();
  }, []);

  return (
    <div>
      <dialog className="insights-card">
        <div>
          <div className="session-header">
            <div>
              <h2>Session Overview</h2>
              <Tooltip
                children={
                  <div>
                    <h6>Total Volume</h6>
                    <span>
                      Raw workload. Adds up reps × weight for every set.
                    </span>
                    <h6>Adjusted Volume</h6>
                    <span>
                      Rep-range weighted volume. Sets in more effective
                      hypertrophy ranges count slightly more than very low or
                      very high reps.
                    </span>
                  </div>
                }
              />
            </div>
            <button onClick={onClose}>X</button>
          </div>
        </div>
        <h3>Insights</h3>
        <span></span>
        <span></span>
        <h3>Recommendations</h3>
        <div>
          <span onClick={getInsights} className="ai-recommendation-btn">
            {!aiInsight ? (
              <>
                View your AI Coach Recommendations <PiCursorClick />{" "}
              </>
            ) : null}
          </span>
        </div>

        <span className="ai-recommendation-response">
          {isLoading ? (
            <TrophySpin
              color="#7F7CAF"
              size="small"
              text="analyzing"
              textColor=""
            />
          ) : (
            aiInsight
          )}
        </span>
      </dialog>
    </div>
  );
};

export default InsightsModal;
