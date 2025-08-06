'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Download, Eye, Image, Type } from 'lucide-react'
import EditableItemModal from '@/components/editable-item-modal'

interface EditableContent {
  id: string // Unique ID, e.g., "v0-editable-text-0", "v0-editable-img-src-1"
  type: 'text' | 'image-src' | 'image-srcset' | 'image-alt' | 'background-image-url'
  value: string // The current value (what's in the editor)
  label: string // Display label
  originalValueStart: number // Start index of the *value* within originalContent
  originalValueEnd: number // End index of the *value* within originalContent
}

export default function BackyardDataEditor() {
  const [originalContent, setOriginalContent] = useState('')
  const [editableItems, setEditableItems] = useState<EditableContent[]>([])
  const [showPreview, setShowPreview] = useState(true) // Show preview by default
  const [editingItem, setEditingItem] = useState<EditableContent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const loadBackyardData = useCallback(async () => {
    try {
      const response = await fetch('/backyard.data')
      const content = await response.text()
      setOriginalContent(content)

      const items: EditableContent[] = []
      let idCounter = 0

      // Regex for text content between tags, excluding content within <style> and <script>
      const textRegex = /(?<!<style[^>]*?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>)(?<!<script[^>]*?>)(>)([^<>\n\r]+?)(<)/g
      let textMatch
      while ((textMatch = textRegex.exec(content)) !== null) {
        const text = textMatch[2].trim()
        if (text && text.length > 0 && !/^\s*&copy;\s*\d{4}\s*Backyard Oasis\.\s*All rights reserved\.\s*\|\s*Licensed & Insured\s*$/.test(text)) {
          const originalValueStart = textMatch.index + textMatch[1].length
          const originalValueEnd = originalValueStart + text.length
          items.push({
            id: `v0-editable-text-${idCounter++}`,
            type: 'text',
            value: text,
            label: `Text: "${text.substring(0, 50).replace(/\s+/g, ' ')}${text.length > 50 ? '...' : ''}"`,
            originalValueStart,
            originalValueEnd,
          })
        }
      }

      // Regex for image src attributes
      const imgSrcRegex = /<img[^>]*?src="([^"]*)"/g
      let imgSrcMatch
      while ((imgSrcMatch = imgSrcRegex.exec(content)) !== null) {
        const src = imgSrcMatch[1]
        const originalValueStart = imgSrcMatch.index + imgSrcMatch[0].indexOf('src="') + 'src="'.length
        const originalValueEnd = originalValueStart + src.length
        items.push({
          id: `v0-editable-image-src-${idCounter++}`,
          type: 'image-src',
          value: src,
          label: `Image (src): ${src.split('/').pop() || src.substring(0, 30)}...`,
          originalValueStart,
          originalValueEnd,
        })
      }

      // Regex for image srcset attributes
      const imgSrcsetRegex = /<img[^>]*?srcset="([^"]*)"/g
      let imgSrcsetMatch
      while ((imgSrcsetMatch = imgSrcsetRegex.exec(content)) !== null) {
        const srcset = imgSrcsetMatch[1]
        const originalValueStart = imgSrcsetMatch.index + imgSrcsetMatch[0].indexOf('srcset="') + 'srcset="'.length
        const originalValueEnd = originalValueStart + srcset.length
        items.push({
          id: `v0-editable-image-srcset-${idCounter++}`,
          type: 'image-srcset',
          value: srcset,
          label: `Image (srcset): ${srcset.substring(0, 50)}...`,
          originalValueStart,
          originalValueEnd,
        })
      }

      // Regex for image alt attributes
      const imgAltRegex = /<img[^>]*?alt="([^"]*)"/g
      let imgAltMatch
      while ((imgAltMatch = imgAltRegex.exec(content)) !== null) {
        const altText = imgAltMatch[1]
        const originalValueStart = imgAltMatch.index + imgAltMatch[0].indexOf('alt="') + 'alt="'.length
        const originalValueEnd = originalValueStart + altText.length
        items.push({
          id: `v0-editable-image-alt-${idCounter++}`,
          type: 'image-alt',
          value: altText,
          label: `Alt Text: "${altText.substring(0, 50).replace(/\s+/g, ' ')}${altText.length > 50 ? '...' : ''}"`,
          originalValueStart,
          originalValueEnd,
        })
      }

      // Regex for background-image URLs in style attributes (simplified for interactive clicking)
      // This will only capture URLs within style="background-image: url(...)"
      const bgImageUrlRegex = /style="[^"]*background-image:\s*url$$['"]?([^)'"]+)['"]?$$[^"]*"/g
      let bgImageUrlMatch
      while ((bgImageUrlMatch = bgImageUrlRegex.exec(content)) !== null) {
        const url = bgImageUrlMatch[1]
        const originalValueStart = bgImageUrlMatch.index + bgImageUrlMatch[0].indexOf(url)
        const originalValueEnd = originalValueStart + url.length
        items.push({
          id: `v0-editable-bg-image-${idCounter++}`,
          type: 'background-image-url',
          value: url,
          label: `Background Image: ${url.split('/').pop() || url.substring(0, 30)}...`,
          originalValueStart,
          originalValueEnd,
        })
      }

      // Sort items by their original starting index to maintain order for reconstruction
      items.sort((a, b) => a.originalValueStart - b.originalValueStart)
      setEditableItems(items)

    } catch (error) {
      console.error('Error loading backyard.data:', error)
    }
  }, [])

  useEffect(() => {
    loadBackyardData()
  }, [loadBackyardData])

  const generateContentForIframe = useCallback(() => {
    let currentContent = originalContent
    const replacements: { start: number; end: number; newString: string }[] = []

    // Create replacements in reverse order to avoid index shifting issues
    const sortedItems = [...editableItems].sort((a, b) => b.originalValueStart - a.originalValueStart)

    sortedItems.forEach(item => {
      let newSegment = item.value
      let dataIdAttribute = `data-v0-editable-id="${item.id}"`

      if (item.type === 'text') {
        // For text, wrap the new value in a span with the data-id
        // This requires finding the surrounding tags to insert the span correctly
        // This is a simplified approach, assuming the text is directly within a tag
        const originalSegment = originalContent.substring(item.originalValueStart - 1, item.originalValueEnd + 1); // Capture >TEXT<
        const openingTagChar = originalSegment.charAt(0); // Should be '>'
        const closingTagChar = originalSegment.charAt(originalSegment.length - 1); // Should be '<'

        if (openingTagChar === '>' && closingTagChar === '<') {
          newSegment = `${openingTagChar}<span ${dataIdAttribute}>${item.value}</span>${closingTagChar}`;
          replacements.push({
            start: item.originalValueStart - 1, // Start from the '>'
            end: item.originalValueEnd + 1, // End at the '<'
            newString: newSegment,
          });
        } else {
          // Fallback for text not directly between > <, just replace value
          replacements.push({
            start: item.originalValueStart,
            end: item.originalValueEnd,
            newString: item.value,
          });
        }
      } else if (item.type.startsWith('image-')) {
        // For image attributes, insert data-id into the img tag itself
        // This requires finding the img tag's start and end
        // This is a simplified approach, assuming the attribute is directly on the img tag
        const originalAttributeString = originalContent.substring(item.originalValueStart - item.type.length + 1, item.originalValueEnd + 1); // e.g., src="url"
        const attributeName = item.type.split('-')[1]; // 'src', 'srcset', 'alt'
        let match;
        let imgTagStart = -1;
        let imgTagEnd = -1;

        // Find the containing <img> tag for this attribute
        const imgTagSearchStart = Math.max(0, item.originalValueStart - 200); // Search backwards
        const imgTagSearchEnd = Math.min(originalContent.length, item.originalValueEnd + 200); // Search forwards
        const searchArea = originalContent.substring(imgTagSearchStart, imgTagSearchEnd);

        const fullImgRegex = /<img[^>]*?>/g;
        while ((match = fullImgRegex.exec(searchArea)) !== null) {
          const currentImgTagStart = imgTagSearchStart + match.index;
          const currentImgTagEnd = currentImgTagStart + match[0].length;

          // Check if our attribute's original position falls within this img tag
          if (item.originalValueStart >= currentImgTagStart && item.originalValueEnd <= currentImgTagEnd) {
            imgTagStart = currentImgTagStart;
            imgTagEnd = currentImgTagEnd;
            break;
          }
        }

        if (imgTagStart !== -1) {
          const originalImgTag = originalContent.substring(imgTagStart, imgTagEnd);
          let newImgTag = originalImgTag;

          // Replace the specific attribute value
          const relativeStart = item.originalValueStart - imgTagStart;
          const relativeEnd = item.originalValueEnd - imgTagStart;
          newImgTag = newImgTag.substring(0, relativeStart) + item.value + newImgTag.substring(relativeEnd);

          // Add data-id if not already present
          if (!newImgTag.includes(dataIdAttribute)) {
            newImgTag = newImgTag.replace(/<img/, `<img ${dataIdAttribute}`);
          }
          replacements.push({
            start: imgTagStart,
            end: imgTagEnd,
            newString: newImgTag,
          });
        } else {
          // Fallback if img tag not found, just replace the value
          replacements.push({
            start: item.originalValueStart,
            end: item.originalValueEnd,
            newString: item.value,
          });
        }
      } else if (item.type === 'background-image-url') {
        // For background-image, replace the URL within the style attribute
        // This is complex to add data-id to the element itself without full HTML parsing.
        // For now, it will only replace the URL value. Interactive clicking for this type
        // will be handled by finding the element with the style attribute.
        replacements.push({
          start: item.originalValueStart,
          end: item.originalValueEnd,
          newString: item.value,
        });
      }
    })

    // Apply replacements from end to start
    replacements.sort((a, b) => b.start - a.start).forEach(rep => {
      currentContent =
        currentContent.substring(0, rep.start) +
        rep.newString +
        currentContent.substring(rep.end)
    })

    // Wrap the content in a full HTML document and add basic styling
    const styledContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Live Preview</title>
        <style>
          /* Basic CSS Reset */
          body, div, h1, h2, h3, p, img, a, ul, li, span, button, video {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
            box-sizing: border-box;
          }
          /* Basic font and line-height for readability */
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            line-height: 1.5;
            color: #333;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Some common styles based on classes observed in backyard.data */
          .color-text-100 { color: #000; }
          .color-text-60 { color: #666; }
          .color-text-40 { color: #999; }
          .type-96 { font-size: 6em; line-height: 1.1; font-weight: bold; }
          .type-60 { font-size: 3.75em; line-height: 1.1; font-weight: bold; }
          .type-48 { font-size: 3em; line-height: 1.2; font-weight: bold; }
          .type-36 { font-size: 2.25em; line-height: 1.2; font-weight: bold; }
          .type-30-light { font-size: 1.875em; line-height: 1.3; font-weight: 300; }
          .type-24 { font-size: 1.5em; line-height: 1.4; font-weight: bold; }
          .type-18 { font-size: 1.125em; line-height: 1.5; }
          .type-15 { font-size: 0.9375em; line-height: 1.5; }
          .type-14 { font-size: 0.875em; line-height: 1.5; }
          .type-regola-regular { font-weight: normal; } /* Placeholder, actual font needs to be loaded */

          /* Basic image styling */
          img {
            max-width: 100%;
            height: auto;
            display: block;
          }
          /* Link styling */
          a {
            color: #007bff; /* A common link color */
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          /* Flexbox for layout classes if they imply it */
          .modern-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr); /* Assuming 12-column grid */
            gap: 16px; /* Example gap */
          }
          .column-1 { grid-column: span 1; }
          .column-3 { grid-column: span 3; }
          .column-5 { grid-column: span 5; }
          .column-6 { grid-column: span 6; }
          .column-10 { grid-column: span 10; }

          /* Basic spacing classes */
          .spacer-4 { height: 4px; width: 100%; }
          .spacer-8 { height: 8px; width: 100%; }
          .spacer-16 { height: 16px; width: 100%; }
          .spacer-24 { height: 24px; width: 100%; }
          .spacer-32 { height: 32px; width: 100%; }
          .spacer-50 { height: 50px; width: 100%; }
          .spacer-64 { height: 64px; width: 100%; }
          .spacer-72 { height: 72px; width: 100%; }
          .spacer-80 { height: 80px; width: 100%; }
          .spacer-100 { height: 100px; width: 100%; }
          .spacer-120 { height: 120px; width: 100%; }
          .spacer-150 { height: 150px; width: 100%; }

          /* Hide elements that are meant for specific viewports */
          .mobile-hidden { display: block; }
          .desktop-hidden { display: block; } /* Default to block, override for specific breakpoints */
          .mobile { display: none; } /* Default to none, override for specific breakpoints */
          .desktop { display: block; } /* Default to block, override for specific breakpoints */

          @media (max-width: 768px) { /* Example breakpoint for mobile */
            .mobile-hidden { display: none; }
            .desktop-hidden { display: block; }
            .mobile { display: block; }
            .desktop { display: none; }

            .m-spacer-0 { height: 0 !important; }
            .m-spacer-16 { height: 16px !important; }
            .m-spacer-24 { height: 24px !important; }
            .m-spacer-32 { height: 32px !important; }
            .m-spacer-50 { height: 50px !important; }
            .m-spacer-64 { height: 64px !important; }
            .m-spacer-100 { height: 100px !important; }

            .m-column-0 { display: none; }
            .m-column-6 { grid-column: span 6; }

            .m-type-12 { font-size: 0.75em; }
            .m-type-14 { font-size: 0.8em; }
            .m-type-15 { font-size: 0.85em; }
            .m-type-18-light { font-size: 1em; font-weight: 300; }
            .m-type-24-light { font-size: 1.2em; font-weight: 300; }
            .m-type-36 { font-size: 1.8em; }
            .m-type-42 { font-size: 2.2em; }
            .m-type-72 { font-size: 3.5em; }
          }
        </style>
      </head>
      <body>
        ${currentContent}
        <script>
          // Post a message to the parent window when the iframe content is loaded
          window.parent.postMessage({ type: 'iframeLoaded' }, '*');
        </script>
      </body>
      </html>
    `;
    return styledContent
  }, [originalContent, editableItems])

  const generateFinalContent = useCallback(() => {
    let finalContent = originalContent
    const replacements: { start: number; end: number; newString: string }[] = []

    // Create replacements in reverse order to avoid index shifting issues
    const sortedItems = [...editableItems].sort((a, b) => b.originalValueStart - a.originalValueStart)

    sortedItems.forEach(item => {
      replacements.push({
        start: item.originalValueStart,
        end: item.originalValueEnd,
        newString: item.value,
      })
    })

    // Apply replacements from end to start
    replacements.sort((a, b) => b.start - a.start).forEach(rep => {
      finalContent =
        finalContent.substring(0, rep.start) +
        rep.newString +
        finalContent.substring(rep.end)
    })

    return finalContent
  }, [originalContent, editableItems])

  const updateItem = useCallback((id: string, newValue: string) => {
    setEditableItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, value: newValue } : item
      )
    )
    setIsModalOpen(false)
    setEditingItem(null)
  }, [])

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDocument) return

    // Remove previous listeners to prevent duplicates on re-render
    const oldElements = iframeDocument.querySelectorAll('[data-v0-editable-id]')
    oldElements.forEach(el => {
      el.removeEventListener('click', handleElementClick)
    })

    // Attach new listeners
    editableItems.forEach(item => {
      const element = iframeDocument.querySelector(`[data-v0-editable-id="${item.id}"]`)
      if (element) {
        element.addEventListener('click', handleElementClick)
      } else if (item.type === 'background-image-url') {
        // For background-image, we need to find the element by its style attribute
        // This is a heuristic and might not be perfect for all cases
        const elementsWithStyle = iframeDocument.querySelectorAll('[style*="background-image"]')
        elementsWithStyle.forEach(el => {
          // Use item.value (current value) for matching
          if (el.getAttribute('style')?.includes(item.value)) {
            el.setAttribute('data-v0-editable-id', item.id); // Temporarily add data-id for click handling
            el.addEventListener('click', handleElementClick);
          }
        });
      }
    })
  }, [editableItems])

  const handleElementClick = useCallback((event: Event) => {
    event.preventDefault()
    event.stopPropagation()
    const target = event.currentTarget as HTMLElement
    const id = target.getAttribute('data-v0-editable-id')
    if (id) {
      const itemToEdit = editableItems.find(item => item.id === id)
      if (itemToEdit) {
        setEditingItem(itemToEdit)
        setIsModalOpen(true)
      }
    }
  }, [editableItems])

  const downloadDataFile = () => {
    const content = generateFinalContent()
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backyard.data'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const content = generateFinalContent()
    navigator.clipboard.writeText(content)
    alert('Updated content copied to clipboard!')
  }

  const textItems = editableItems.filter(item => item.type === 'text' || item.type === 'image-alt')
  const imageItems = editableItems.filter(item => item.type === 'image-src' || item.type === 'image-srcset' || item.type === 'background-image-url')

  // Render iframe content whenever editableItems or originalContent changes
  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
      if (iframeDocument) {
        iframeDocument.open()
        iframeDocument.write(generateContentForIframe())
        iframeDocument.close()
      }
    }

    // Listen for messages from the iframe to know when its content is fully loaded
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from our iframe and is the 'iframeLoaded' type
      if (event.source === iframeRef.current?.contentWindow && event.data.type === 'iframeLoaded') {
        handleIframeLoad();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [generateContentForIframe, handleIframeLoad]);


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Backyard Content Editor</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button onClick={copyToClipboard} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Copy Content
            </Button>
            <Button onClick={downloadDataFile}>
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>

        {showPreview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Live Page Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded overflow-hidden" style={{ height: '600px', width: '100%' }}>
                <iframe
                  ref={iframeRef}
                  title="Live Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin" // Restrict some iframe capabilities for safety
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="text" className="space-y-4">
          <TabsList>
            <TabsTrigger value="text">
              <Type className="w-4 h-4 mr-2" />
              Text Content ({textItems.length})
            </TabsTrigger>
            <TabsTrigger value="images">
              <Image className="w-4 h-4 mr-2" />
              Images ({imageItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <Card>
              <CardHeader>
                <CardTitle>Text Content</CardTitle>
                <p className="text-sm text-gray-600">
                  Edit any text content (including alt text) found in your HTML. The surrounding HTML tags will remain unchanged.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {textItems.map((item) => (
                  <div key={item.id} className="border p-4 rounded space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {item.label}
                    </Label>
                    <Textarea
                      value={item.value}
                      onChange={(e) => updateItem(item.id, e.target.value)}
                      className="min-h-[60px]"
                      placeholder="Enter text content"
                    />
                  </div>
                ))}
                {textItems.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No text content found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <p className="text-sm text-gray-600">
                  Edit image URLs and background images. The HTML structure will remain unchanged.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {imageItems.map((item) => (
                  <div key={item.id} className="border p-4 rounded space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {item.label}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={item.value}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        placeholder="Enter image URL"
                        className="flex-1"
                      />
                      {item.value && (item.type === 'image-src' || item.type === 'background-image-url') && (
                        <div className="w-16 h-16 border rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.value || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {imageItems.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No images found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editingItem && (
          <EditableItemModal
            item={editingItem}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={updateItem}
          />
        )}
      </div>
    </div>
  )
}
