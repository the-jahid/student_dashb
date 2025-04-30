"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, Upload, Check, X, FileText, Trash2, Download, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UploadClient } from "@uploadcare/upload-client"

// Initialize Uploadcare client
const client = new UploadClient({ publicKey: "549b3f0502ec4b4c7c20" })

type FileInfo = {
  id: number
  name: string
  size: string
  date: string
  status: "complete" | "failed" | "processing"
  url?: string
}

export default function FilePage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([])
  const [fileType, setFileType] = useState("programs")
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    // Load files from localStorage if available
    const storedFiles = localStorage.getItem("uploadedFiles")
    if (storedFiles) {
      try {
        setUploadedFiles(JSON.parse(storedFiles))
      } catch (error) {
        console.error("Error parsing stored files:", error)
      }
    }
  }, [])

  const saveFilesToStorage = (files: FileInfo[]) => {
    localStorage.setItem("uploadedFiles", JSON.stringify(files))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const sendToWebhook = async (fileUrl: string) => {
    try {
      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Webhook response:", data)
      setNotification({ type: "success", message: "File URL sent to webhook successfully" })
    } catch (error) {
      console.error("Error sending to webhook:", error)
      setNotification({ type: "error", message: `Failed to send to webhook: ${(error as Error).message}` })
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setNotification({ type: "error", message: "Please select a file first" })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 200)

    try {
      // Upload file to Uploadcare
      const uploadcareFile = await client.uploadFile(selectedFile)
      const fileUrl = `https://ucarecdn.com/${uploadcareFile.uuid}/${selectedFile.name}`

      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Add to uploaded files
      const newFile: FileInfo = {
        id: Date.now(),
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        date: new Date().toISOString().split("T")[0],
        status: "complete",
        url: fileUrl,
      }

      const updatedFiles = [newFile, ...uploadedFiles]
      setUploadedFiles(updatedFiles)
      saveFilesToStorage(updatedFiles)

      // Send to webhook
      await sendToWebhook(fileUrl)

      // Reset state
      setSelectedFile(null)
      setNotification({ type: "success", message: "File uploaded successfully" })

      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Upload error:", error)
      setNotification({ type: "error", message: `Upload failed: ${(error as Error).message}` })

      // Add failed upload to list
      const failedFile: FileInfo = {
        id: Date.now(),
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        date: new Date().toISOString().split("T")[0],
        status: "failed",
      }

      const updatedFiles = [failedFile, ...uploadedFiles]
      setUploadedFiles(updatedFiles)
      saveFilesToStorage(updatedFiles)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = (id: number) => {
    const updatedFiles = uploadedFiles.filter((file) => file.id !== id)
    setUploadedFiles(updatedFiles)
    saveFilesToStorage(updatedFiles)
    setNotification({ type: "success", message: "File deleted successfully" })
  }

  const handleDownload = (file: FileInfo) => {
    if (file.url) {
      window.open(file.url, "_blank")
    } else {
      setNotification({ type: "error", message: "Download URL not available" })
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      {notification && (
        <Alert
          className={`mb-4 ${notification.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"}`}
        >
          <AlertCircle className={`h-4 w-4 ${notification.type === "error" ? "text-red-600" : "text-green-600"}`} />
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="manage">Manage Files</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Program Information</CardTitle>
              <CardDescription>
                Upload CSV files containing program details, requirements, and other information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-type">File Type</Label>
                <select
                  id="file-type"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="programs">Programs Information</option>
                  <option value="scholarships">Scholarships</option>
                  <option value="requirements">Application Requirements</option>
                  <option value="deadlines">Deadlines</option>
                </select>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center ${selectedFile ? "border-green-300 bg-green-50" : "border-gray-300"}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setSelectedFile(e.dataTransfer.files[0])
                  }
                }}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <FileUp className={`h-10 w-10 ${selectedFile ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="space-y-2">
                    {selectedFile ? (
                      <>
                        <h3 className="font-medium text-green-600">File selected: {selectedFile.name}</h3>
                        <p className="text-sm text-muted-foreground">Size: {formatFileSize(selectedFile.size)}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium">Drag and drop your file</h3>
                        <p className="text-sm text-muted-foreground">Support for CSV files up to 10MB</p>
                      </>
                    )}
                  </div>
                  <Input id="file-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                  <Button asChild>
                    <label htmlFor="file-upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Browse Files
                    </label>
                  </Button>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading {selectedFile?.name}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("manage")}>
                View Uploaded Files
              </Button>
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Uploaded Files</CardTitle>
              <CardDescription>View, download, or delete your uploaded program information files.</CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No files have been uploaded yet.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("upload")}>
                    Upload Your First File
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {file.name}
                          </div>
                        </TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>{file.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {file.status === "complete" ? (
                              <>
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">Processed</span>
                              </>
                            ) : file.status === "processing" ? (
                              <>
                                <Upload className="h-4 w-4 text-amber-500 animate-pulse" />
                                <span className="text-sm text-muted-foreground">Processing</span>
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-muted-foreground">Failed</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(file)}
                              disabled={!file.url || file.status !== "complete"}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setActiveTab("upload")}>
                Upload New File
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
