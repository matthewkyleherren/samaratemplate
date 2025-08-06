'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface EditableContent {
  id: string
  type: 'text' | 'image-src' | 'image-srcset' | 'image-alt' | 'background-image-url'
  value: string
  label: string
  originalValueStart: number
  originalValueEnd: number
}

interface EditableItemModalProps {
  item: EditableContent
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, newValue: string) => void
}

export default function EditableItemModal({
  item,
  isOpen,
  onClose,
  onSave,
}: EditableItemModalProps) {
  const [currentValue, setCurrentValue] = useState(item.value)

  useEffect(() => {
    setCurrentValue(item.value)
  }, [item.value])

  const handleSave = () => {
    onSave(item.id, currentValue)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCurrentValue(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const isImageField = item.type === 'image-src' || item.type === 'background-image-url'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {item.label.split(':')[0]}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            {item.type === 'text' || item.type === 'image-alt' ? (
              <Textarea
                id="value"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="col-span-3 min-h-[100px]"
              />
            ) : (
              <Input
                id="value"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="col-span-3"
              />
            )}
          </div>
          {isImageField && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file-upload" className="text-right">
                Upload
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="col-span-3"
              />
            </div>
          )}
          {isImageField && currentValue && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Preview</Label>
              <div className="col-span-3 w-full h-32 border rounded overflow-hidden flex items-center justify-center">
                <img
                  src={currentValue || "/placeholder.svg"}
                  alt="Image Preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = 'Invalid URL or failed to load image.';
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
