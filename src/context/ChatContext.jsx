/**
 * context/ChatContext.jsx
 *
 * Central state manager for the chat application.
 *
 * Manages:
 *   - Conversation messages (user + AI)
 *   - Execution steps (for the live panel)
 *   - Loading state
 *   - SSE connection lifecycle
 *
 * Why a Context over Redux/Zustand?
 * The state shape is shallow and the update patterns are simple
 * (append message, append step, toggle loading). Context + useReducer
 * is the right tool at this complexity level.
 */

import { createContext, useContext, useReducer, useCallback, useRef } from "react";
import { sendChatQuery } from "../services/api.js";
import { parseSSEStream } from "../services/stream.js";

const ChatContext = createContext(null);

// ── State Shape ─────────────────────────────────────────────────────────
const initialState = {
  messages: [],           // [{id, role: "user"|"ai", content, report, timestamp}]
  executionSteps: [],     // [{id, type, step, tool, status, timestamp}] (legacy fallback)
  developerTraces: [],    // All raw telemetry events for Developer Trace panel
  isLoading: false,
  error: null,
  activeQuery: null,
};

// ── Reducer ─────────────────────────────────────────────────────────────
function chatReducer(state, action) {
  switch (action.type) {
    case "SEND_QUERY":
      return {
        ...state,
        isLoading: true,
        error: null,
        activeQuery: action.query,
        executionSteps: [],
        developerTraces: [],
        messages: [
          ...state.messages,
          {
            id: `user-${Date.now()}`,
            role: "user",
            content: action.query,
            timestamp: new Date(),
          },
        ],
      };

    case "ADD_EXECUTION_STEP": {
      const newStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date(),
        ...action.step,
      };
      return {
        ...state,
        developerTraces: [...state.developerTraces, newStep],
        executionSteps: [
          ...state.executionSteps,
          newStep,
        ],
      };
    }

    case "RECEIVE_RESULT":
      return {
        ...state,
        isLoading: false,
        activeQuery: null,
        messages: [
          ...state.messages,
          {
            id: `ai-${Date.now()}`,
            role: "ai",
            content: action.report?.rawReasoning ?? action.report?.summary ?? "",
            report: action.report,
            timestamp: new Date(),
          },
        ],
      };

    case "SET_ERROR":
      return {
        ...state,
        isLoading: false,
        activeQuery: null,
        error: action.error,
        messages: [
          ...state.messages,
          {
            id: `error-${Date.now()}`,
            role: "ai",
            content: `⚠️ ${action.error}`,
            report: null,
            timestamp: new Date(),
          },
        ],
      };

    case "CLEAR_CONVERSATION":
      return { ...initialState };

    default:
      return state;
  }
}

// ── Provider ────────────────────────────────────────────────────────────
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (query) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "SEND_QUERY", query });

    // Build conversation history from previous messages
    const conversationHistory = state.messages
      .slice(-10)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content?.slice(0, 1000) ?? "",
      }));

    try {
      const response = await sendChatQuery(
        query,
        conversationHistory,
        controller.signal
      );

      await parseSSEStream(response, (event) => {
        if (controller.signal.aborted) return;

        switch (event.type) {
          case "result":
            dispatch({ type: "RECEIVE_RESULT", report: event.report });
            break;
          case "error":
            if (event.message) {
              dispatch({ type: "SET_ERROR", error: event.message });
            }
            // Also add the error to developer traces
            dispatch({ type: "ADD_EXECUTION_STEP", step: event });
            break;
          default:
            dispatch({ type: "ADD_EXECUTION_STEP", step: event });
        }
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      dispatch({
        type: "SET_ERROR",
        error: err.message ?? "An unexpected error occurred.",
      });
    } finally {
      abortRef.current = null;
    }
  }, [state.messages]);

  const clearConversation = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    dispatch({ type: "CLEAR_CONVERSATION" });
  }, []);

  const cancelQuery = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      dispatch({ type: "SET_ERROR", error: "Query cancelled." });
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        clearConversation,
        cancelQuery,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export default ChatContext;
