import { useEffect, useRef, useState } from "react";

interface SpeechToTextOptions {
  interimResults?: boolean;
  continuous?: boolean;
}

const useSpeechToText = (options: SpeechToTextOptions = {}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Web Speech API is not supported in this browser.");
      return;
    }

    recognitionRef.current = new (window as any).webkitSpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = "en-US";
    recognition.continuous = options.continuous ?? false;

    if ("webkitSpeechGrammarList" in window) {
      const grammar = `
        #JSGF V1.0;
        grammar punctuation;
        public <punctuation> = comma | period | question mark | exclamation mark;
      `;
      const speechRecognitionList = new (
        window as any
      ).webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
  };
};

export default useSpeechToText;

// javascript only

// import React, { useEffect, useRef, useState } from "react";

// const useSpeechToText = (options) => {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const recognitionRef = useRef(null);

//   useEffect(() => {
//     if (!("webkitSpeechRecognition" in window)) {
//       console.error("Web speech api is not supported");
//       return;
//     }

//     recognitionRef.current = new window.webkitSpeechRecognition();
//     const recognition = recognitionRef.current;
//     recognition.interimResults = options.interimResults || true;
//     recognition.lang = "en-US";
//     recognition.continuous = options.continuous || false;

//     if ("webkitSpeechGrammarList" in window) {
//       const grammar = `
//         #JSGF V1.0;
//         grammar punctuation;
//         public <punctuation> = comma | period | question mark | exclamation mark;
//       `;
//       const speechRecognitionList = new window.webkitSpeechGrammarList();
//       speechRecognitionList.addFromString(grammar, 1);
//       recognition.grammars = speechRecognitionList;
//     }

//     recognition.onresult = (event) => {
//       let text = "";
//       for (let i = 0; i < event.results.length; i++) {
//         text += event.results[i][0].transcript;
//         if (text.includes("execute")) {
//           console.log(text);
//         }
//       }
//       setTranscript(text);
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech recognition error: ", event.error);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//       setTranscript("");
//     };

//     return () => {
//       recognition.stop();
//     };
//   }, []);

//   const startListening = () => {
//     if (recognitionRef.current && !isListening) {
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   };

//   const stopListening = () => {
//     if (recognitionRef.current && isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     }
//   };

//   return {
//     isListening,
//     transcript,
//     startListening,
//     stopListening,
//   };
// };

// export default useSpeechToText;
