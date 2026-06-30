import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { WorldCupData, Match } from "@/lib/worldcup/types";
import type { Prediction, PredictionMatch } from "@/types/prediction";
import { simulateWinner } from "@/lib/worldcup/bracketEngine";
import { processWorldCupData } from "@/lib/worldcup/bracketEngine";

const STORAGE_KEY = "lqf-simulation-v1";

export interface SimulationScores {
  [matchId: string]: {
    homeScore: number | null;
    awayScore: number | null;
    decidedByPenalties: boolean;
    penaltyWinnerId: string | null;
  };
}

export interface SimulatorState {
  simData: WorldCupData | null;
  scores: SimulationScores;
  participantName: string;
  participantCity: string;
  channelSubscribed: boolean;
  termsAccepted: boolean;
  formSubmitted: boolean;
  savedPrediction: Prediction | null;
}

type Action =
  | { type: "INIT"; payload: WorldCupData }
  | { type: "PICK_WINNER"; matchId: string; slot: "home" | "away" }
  | {
      type: "SET_SCORE";
      matchId: string;
      homeScore: number | null;
      awayScore: number | null;
      decidedByPenalties?: boolean;
      penaltyWinnerId?: string | null;
    }
  | { type: "SET_PARTICIPANT"; name: string; city: string }
  | { type: "SET_CHANNEL_SUBSCRIBED"; value: boolean }
  | { type: "SET_TERMS_ACCEPTED"; value: boolean }
  | { type: "SET_FORM_SUBMITTED"; value: boolean }
  | { type: "SET_SAVED_PREDICTION"; prediction: Prediction }
  | { type: "RESET" };

function simReducer(state: SimulatorState, action: Action): SimulatorState {
  switch (action.type) {
    case "INIT": {
      // Try to load saved state from localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const restoredSim = processWorldCupData({
            ...saved.simData,
            bracket: [],
          });
          return { ...state, ...saved, simData: restoredSim };
        }
      } catch {}
      return { ...state, simData: action.payload, scores: {} };
    }
    case "PICK_WINNER": {
      if (!state.simData) return state;
      const newMatches = simulateWinner(
        state.simData.matches,
        action.matchId,
        action.slot,
      );
      const next = processWorldCupData({ ...state.simData, matches: newMatches });
      // Clear scores for matches that depend on this one
      const newScores = { ...state.scores };
      // Find which match was picked to remove downstream scores
      const clearedMatches = new Set<string>();
      const collectForward = (matchId: string) => {
        const m = state.simData!.matches.find((x) => x.id === matchId);
        if (!m?.nextMatchId) return;
        clearedMatches.add(m.nextMatchId);
        collectForward(m.nextMatchId);
      };
      collectForward(action.matchId);
      for (const id of clearedMatches) {
        delete newScores[id];
      }
      const newState = { ...state, simData: next, scores: newScores };
      persistSim(newState);
      return newState;
    }
    case "SET_SCORE": {
      const newScores = {
        ...state.scores,
        [action.matchId]: {
          homeScore: action.homeScore,
          awayScore: action.awayScore,
          decidedByPenalties: action.decidedByPenalties ?? false,
          penaltyWinnerId: action.penaltyWinnerId ?? null,
        },
      };
      const newState = { ...state, scores: newScores };
      persistSim(newState);
      return newState;
    }
    case "SET_PARTICIPANT":
      return { ...state, participantName: action.name, participantCity: action.city };
    case "SET_CHANNEL_SUBSCRIBED":
      return { ...state, channelSubscribed: action.value };
    case "SET_TERMS_ACCEPTED":
      return { ...state, termsAccepted: action.value };
    case "SET_FORM_SUBMITTED":
      return { ...state, formSubmitted: action.value };
    case "SET_SAVED_PREDICTION":
      return { ...state, savedPrediction: action.prediction };
    case "RESET": {
      localStorage.removeItem(STORAGE_KEY);
      return {
        ...initialState,
        simData: state.simData ? processWorldCupData({ ...state.simData, matches: state.simData.matches.map(m => ({...m, homeScore: null, awayScore: null, status: m.status === 'finished' ? 'finished' : 'scheduled', winner: null})) }) : null,
      };
    }
    default:
      return state;
  }
}

function persistSim(state: SimulatorState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        simData: state.simData,
        scores: state.scores,
        participantName: state.participantName,
        participantCity: state.participantCity,
      }),
    );
  } catch {}
}

const initialState: SimulatorState = {
  simData: null,
  scores: {},
  participantName: "",
  participantCity: "",
  channelSubscribed: false,
  termsAccepted: false,
  formSubmitted: false,
  savedPrediction: null,
};

interface SimulatorContextValue {
  state: SimulatorState;
  initSimulator: (data: WorldCupData) => void;
  pickWinner: (matchId: string, slot: "home" | "away") => void;
  setScore: (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    decidedByPenalties?: boolean,
    penaltyWinnerId?: string | null,
  ) => void;
  setParticipant: (name: string, city: string) => void;
  setChannelSubscribed: (value: boolean) => void;
  setTermsAccepted: (value: boolean) => void;
  setFormSubmitted: (value: boolean) => void;
  setSavedPrediction: (prediction: Prediction) => void;
  reset: () => void;
  buildPredictionMatches: () => PredictionMatch[];
}

const SimulatorContext = createContext<SimulatorContextValue | null>(null);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simReducer, initialState);

  const initSimulator = useCallback((data: WorldCupData) => {
    dispatch({ type: "INIT", payload: data });
  }, []);

  const pickWinner = useCallback((matchId: string, slot: "home" | "away") => {
    dispatch({ type: "PICK_WINNER", matchId, slot });
  }, []);

  const setScore = useCallback(
    (
      matchId: string,
      homeScore: number | null,
      awayScore: number | null,
      decidedByPenalties?: boolean,
      penaltyWinnerId?: string | null,
    ) => {
      dispatch({
        type: "SET_SCORE",
        matchId,
        homeScore,
        awayScore,
        decidedByPenalties,
        penaltyWinnerId,
      });
    },
    [],
  );

  const setParticipant = useCallback((name: string, city: string) => {
    dispatch({ type: "SET_PARTICIPANT", name, city });
  }, []);

  const setChannelSubscribed = useCallback((value: boolean) => {
    dispatch({ type: "SET_CHANNEL_SUBSCRIBED", value });
  }, []);

  const setTermsAccepted = useCallback((value: boolean) => {
    dispatch({ type: "SET_TERMS_ACCEPTED", value });
  }, []);

  const setFormSubmitted = useCallback((value: boolean) => {
    dispatch({ type: "SET_FORM_SUBMITTED", value });
  }, []);

  const setSavedPrediction = useCallback((prediction: Prediction) => {
    dispatch({ type: "SET_SAVED_PREDICTION", prediction });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const buildPredictionMatches = useCallback((): PredictionMatch[] => {
    if (!state.simData) return [];
    const knockoutMatches = state.simData.matches.filter(
      (m: Match) => m.stage !== "GROUP_STAGE",
    );
    return knockoutMatches.map((m: Match) => {
      const score = state.scores[m.id];
      const winnerId = m.winner ?? score?.penaltyWinnerId ?? null;
      const winnerTeam =
        winnerId === m.homeTeam?.id ? m.homeTeam : winnerId === m.awayTeam?.id ? m.awayTeam : null;
      return {
        matchId: m.id,
        round: m.round ?? m.stage,
        homeTeamId: m.homeTeam?.id,
        homeTeamName: m.homeTeam?.name,
        awayTeamId: m.awayTeam?.id,
        awayTeamName: m.awayTeam?.name,
        predictedHomeScore: score?.homeScore ?? null,
        predictedAwayScore: score?.awayScore ?? null,
        predictedWinnerId: winnerId,
        predictedWinnerName: winnerTeam?.name ?? null,
        decidedByPenalties: score?.decidedByPenalties ?? false,
        points: 0,
        scoreReason: "",
      };
    });
  }, [state.simData, state.scores]);

  return (
    <SimulatorContext.Provider
      value={{
        state,
        initSimulator,
        pickWinner,
        setScore,
        setParticipant,
        setChannelSubscribed,
        setTermsAccepted,
        setFormSubmitted,
        setSavedPrediction,
        reset,
        buildPredictionMatches,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator(): SimulatorContextValue {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error("useSimulator must be used inside SimulatorProvider");
  return ctx;
}
