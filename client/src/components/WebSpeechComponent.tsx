import React, { useEffect, useState } from "react";
import useSpeechToText from "@/hooks/useSpeechToText";
import { Textarea } from "./ui/textarea";

import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";
import { processCommand } from "@/utils/commandProcess";

const WebSpeechComponent = () => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [textInput, setTextInput] = useState("");
  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
  } = useSpeechToText({ continuous: true });

  const startStopListening = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startListening();
    }
  };

  const stopVoiceInput = () => {
    setTextInput(textInput);
    stopListening();
  };
  useEffect(() => {
    if (isListening) {
      const finalText =
        textInput +
        (transcript.length ? (textInput.length ? " " : "") + transcript : "");

      const startLength = textInput.length;

      setTextInput(finalText.slice(startLength));
    }
  }, [transcript]);

  useEffect(() => {
    if (textInput.includes("execute")) {
      parseCommands(textInput);
    }
  }, [textInput]);

  const setBrightnessValue = useAdjustStore(
    (state) => state.setBrightnessValue
  );

  const parseCommands = async (textCommand: string) => {
    try {
      const response = await apiClient.post(
        "/text/parse_command",
        { textCommand },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      const command = response.data.data;

      processCommand(command);

      toast({
        description: response.data.message,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        description: `Failed to make project ${error}
          }`,
        className: "bg-red-500 text-white",
      });
    }
  };
  const [isSpeakerOpen, setIsSpeakerOpen] = useState(false);

  return (
    <div>
      <button
        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
        onClick={() => {
          setIsSpeakerOpen(!isSpeakerOpen);
          startStopListening();
        }}
      >
        {isListening ? <Mic /> : <MicOff />}
      </button>
      {/* Speaker Input Area */}
      {isSpeakerOpen && (
        <div className="absolute top-[-200px] left-[-150px] w-[300px] max-w-md p-4 mt-2 bg-white rounded-lg shadow-md z-10 flex flex-col justify-around h-[180px]">
          <Textarea
            // disabled={isListening}
            className="mt-4 h-[100px]"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Speak and your text will appear here..."
          />
          <button
            className="w-full custom-button"
            onClick={() => parseCommands(textInput)}
          >
            Proceed
          </button>
        </div>
      )}
    </div>
  );
};

export default WebSpeechComponent;
