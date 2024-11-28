import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
  } from "@/components/ui/menubar"


  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  

  


  import { House} from "lucide-react"
  import { Crop} from "lucide-react"
  import { RotateCwSquare} from "lucide-react"
  import { ListPlus} from "lucide-react"
  import { Type} from "lucide-react"
  import { PenTool} from "lucide-react"
  import { Cpu } from "lucide-react"

const MainPage = () => {
  return (
    <div className="flex">
  <Menubar className="flex flex-col gap-5 mt-10">

<MenubarMenu>
<TooltipProvider>
    <Tooltip>
      <TooltipTrigger> <MenubarTrigger><House /></MenubarTrigger></TooltipTrigger>
         <TooltipContent>
           <p>Home</p>
         </TooltipContent>
  </Tooltip>
</TooltipProvider>
</MenubarMenu>


<MenubarMenu>
<TooltipProvider>
    <Tooltip>
      <TooltipTrigger> <MenubarTrigger><Crop /></MenubarTrigger></TooltipTrigger>
         <TooltipContent>
           <p>Crop</p>
         </TooltipContent>
  </Tooltip>
</TooltipProvider>
</MenubarMenu>


<MenubarMenu>
<TooltipProvider>
    <Tooltip>
      <TooltipTrigger>  <MenubarTrigger><RotateCwSquare /></MenubarTrigger></TooltipTrigger>
         <TooltipContent>
           <p>Arrange</p>
         </TooltipContent>
  </Tooltip>
</TooltipProvider>
</MenubarMenu>


<MenubarMenu>
<TooltipProvider>
    <Tooltip>
      <TooltipTrigger> <MenubarTrigger><ListPlus /></MenubarTrigger></TooltipTrigger>
         <TooltipContent>
           <p>Adjust</p>
         </TooltipContent>
  </Tooltip>
</TooltipProvider>
</MenubarMenu>

<MenubarMenu>
<TooltipProvider>
    <Tooltip>
      <TooltipTrigger> <MenubarTrigger><Type /></MenubarTrigger></TooltipTrigger>
         <TooltipContent>
           <p>Text</p>
         </TooltipContent>
  </Tooltip>
</TooltipProvider>
</MenubarMenu>

<MenubarMenu>
<TooltipProvider>
    <Tooltip>
      <TooltipTrigger> <MenubarTrigger><PenTool /></MenubarTrigger></TooltipTrigger>
         <TooltipContent>
           <p>Drawing</p>
         </TooltipContent>
  </Tooltip>
</TooltipProvider>
</MenubarMenu>


<MenubarMenu>
<TooltipProvider>
    <Tooltip>
      <TooltipTrigger> <MenubarTrigger><Cpu /></MenubarTrigger></TooltipTrigger>
         <TooltipContent>
           <p>AI</p>
         </TooltipContent>
  </Tooltip>
</TooltipProvider>
</MenubarMenu>
</Menubar>
    </div>

)
}

export default MainPage



