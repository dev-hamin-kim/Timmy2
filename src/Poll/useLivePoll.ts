import { LiveState } from "@microsoft/live-share";
import { useDynamicDDS } from "@microsoft/live-share-react";
import { useEffect, useState } from "react";
import { PollState } from "./types";

const POLL_KEY = "LIVE-POLL";

export function useLivePoll() {
    const { dds: pollState } = useDynamicDDS<LiveState<PollState[]>>(
        POLL_KEY,
        LiveState
    );

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            if (!pollState || isInitialized) return;
            if (pollState.initializeState !== "needed") return;

            // LiveState.initialize() returns a Promise<void>
            await pollState.initialize([]);

            if (!cancelled) {
                setIsInitialized(true);
            }
        }

        init();

        return () => {
            cancelled = true;
        };
    }, [pollState, isInitialized]);

    return {
        pollState,
        isInitialized,
    };
}