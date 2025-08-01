import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface DownloadDialogProps {
  previewUrl: string
  onDownload: (format: "png" | "jpeg", cropOnly: boolean) => void
  width: number
  height: number
}

export function DownloadDialog({ previewUrl, onDownload, width, height }: DownloadDialogProps) {
  const [format, setFormat] = React.useState<"png" | "jpeg">("png")
  const [cropOnly, setCropOnly] = React.useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300 px-4 py-2">
          <span className="hidden lg:inline">Download</span>
          <Download className="lg:hidden w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Download Image</DialogTitle>
          <DialogDescription>
            Choose your preferred format and options before downloading.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {/* Left side - Preview */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Dimensions: {width} × {height}px
            </p>
          </div>

          {/* Right side - Options */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Format</h4>
              <RadioGroup defaultValue={format} onValueChange={(val: "png" | "jpeg") => setFormat(val)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="png" id="png" />
                  <Label htmlFor="png">PNG</Label>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                    - Best for transparent backgrounds
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpeg" id="jpeg" />
                  <Label htmlFor="jpeg">JPEG</Label>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                    - Smaller file size
                  </span>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cropOnly" 
                checked={cropOnly}
                onCheckedChange={(checked: boolean) => setCropOnly(checked)}
              />
              <label
                htmlFor="cropOnly"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Download cropped area only
              </label>
            </div>

            <Button 
              className="w-full"
              onClick={() => onDownload(format, cropOnly)}
            >
              Download Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
