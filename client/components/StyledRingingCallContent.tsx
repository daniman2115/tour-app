// components/StyledRingingCallContent.tsx
// Replacement for the SDK's <RingingCallContent />, used by VideoProvider.
// Ringing states keep the SDK's IncomingCall / OutgoingCall screens (so accept,
// decline and join behave exactly as before). Once the call is connected it
// shows the new top bar and controls.
import {
  CallContent,
  CallingState,
  IncomingCall,
  OutgoingCall,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { CALL_BG, CallControlsBar, CallTopBar } from "./Callui";

const StyledRingingCallContent = () => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const isCallCreatedByMe = call?.isCreatedByMe ?? false;

  // Same states your call screen treats as "still ringing / connecting"
  if (
    [CallingState.RINGING, CallingState.JOINING, CallingState.IDLE].includes(
      callingState,
    )
  ) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: CALL_BG }}>
        {isCallCreatedByMe ? <OutgoingCall /> : <IncomingCall />}
      </SafeAreaView>
    );
  }

  return <CallContent CallTopView={CallTopBar} CallControls={CallControlsBar} />;
};

export default StyledRingingCallContent;