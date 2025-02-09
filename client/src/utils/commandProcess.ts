import { useAdjustStore } from "@/hooks/appStore/AdjustStore"
import { useCommonProps } from "@/hooks/appStore/CommonProps"


export const processCommand = (command: { operation: string; value: any}) => {
  const { setSidebarName } = useCommonProps.getState(); 
  const { setBrightnessValue } = useAdjustStore.getState();


  switch(command.operation){
    case "brightness":
      setSidebarName("Adjust")
      setTimeout(() => {setBrightnessValue(command.value)}, 5000)
  }


}