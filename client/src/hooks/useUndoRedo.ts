import { useState, useEffect, useCallback, useRef } from "react";


const useUndoRedo = (limit=25) => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // set
  const set = (value) => {
    let newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(value);

    if (newHistory.length > limit) {
      newHistory = newHistory.slice(newHistory.length - limit);
    }

    setHistory(newHistory)
    setCurrentIndex(newHistory.length - 1);

  }


  // undo
  const undo = useCallback(() => {
    console.log('undo', currentIndex-1)
    setCurrentIndex((currentIndex) => Math.max(currentIndex-1, 0));
    
    isUndoRedoAction.current = true;
  }, [history.length])

  // redo 
  const redo = useCallback(() => {
    setCurrentIndex((currentIndex) => Math.min(currentIndex + 1, history.length - 1));
    isUndoRedoAction.current = true;
  }, [history.length])

  useEffect(() => {
    
    const handleKewdown = (event) => {
      if(event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        redo()
      }
    }
  
    window.addEventListener('keydown', handleKewdown);
    return () => {
      window.removeEventListener('keydown', handleKewdown);
    }
  }, [undo, redo])
  
  useEffect(() => {
    console.log('History:', history)
  
  }, [history])
  
  
  return [currentIndex, history[currentIndex], set, undo, redo, isUndoRedoAction] 

}


export default useUndoRedo;