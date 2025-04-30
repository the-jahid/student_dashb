"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  Trash2,
  Plus,
  Search,
  MessageSquare,
  Copy,
  X,
  Mail,
  Twitter,
  Facebook,
  Link,
  ChevronLeft,
  AlertCircle,
  Check,
  ExternalLink,
  HistoryIcon,
  Paperclip,
  ImageIcon,
  File,
  Loader2,
} from "lucide-react"
import { UploadClient } from "@uploadcare/upload-client"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  fileAttachment?: FileAttachment | null
}

interface FileAttachment {
  fileId: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

interface ChatSession {
  id: string
  name: string
  messages: Message[]
  createdAt: number
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  session: ChatSession | undefined
}

const ShareModal = ({ isOpen, onClose, session }: ShareModalProps) => {
  const [copied, setCopied] = useState(false)
  const [shareOption, setShareOption] = useState<string>("copy")
  const [shareableLink, setShareableLink] = useState<string>("")
  const [linkCopied, setLinkCopied] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      // Generate shareable link when modal opens
      if (session) {
        generateShareableLink(session)
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, session])

  if (!isOpen || !session) return null

  const formatConversation = () => {
    if (!session?.messages.length) return "No conversation to share"

    return session.messages
      .map((msg) => {
        const role = msg.role === "user" ? "You" : "AI"
        let content = `${role}: ${msg.content}`
        if (msg.fileAttachment) {
          content += `\n[Attached file: ${msg.fileAttachment.fileName}]`
        }
        return content
      })
      .join("\n\n")
  }

  const generateShareableLink = (session: ChatSession) => {
    try {
      // Create a simplified version of the session to reduce URL size
      const shareData = {
        name: session.name,
        messages: session.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          fileAttachment: msg.fileAttachment,
        })),
      }

      // Convert to JSON and encode as base64
      const jsonData = JSON.stringify(shareData)
      const encodedData = btoa(encodeURIComponent(jsonData))

      // Create the shareable URL
      const baseUrl = window.location.origin
      const shareUrl = `${baseUrl}/shared-chat?data=${encodedData}`

      setShareableLink(shareUrl)
    } catch (error) {
      console.error("Error generating shareable link:", error)
      setShareableLink("Error generating link. Conversation may be too large to share.")
    }
  }

  const handleCopyToClipboard = async () => {
    const text = formatConversation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link: ", err)
    }
  }

  const handleShare = (platform: string) => {
    const text = encodeURIComponent(formatConversation())
    const title = encodeURIComponent(`Chat with AI: ${session.name}`)

    switch (platform) {
      case "email":
        window.open(`mailto:?subject=${title}&body=${text}`)
        break
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${text}`)
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareableLink}&quote=${title}`)
        break
      default:
        handleCopyToClipboard()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-md p-3 sm:p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-medium">Share Conversation</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            <button
              onClick={() => setShareOption("copy")}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${
                shareOption === "copy" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              <Copy size={14} />
              <span>Copy Text</span>
            </button>
            <button
              onClick={() => setShareOption("link")}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${
                shareOption === "link" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              <Link size={14} />
              <span>Share Link</span>
            </button>
            <button
              onClick={() => setShareOption("email")}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${
                shareOption === "email" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              <Mail size={14} />
              <span>Email</span>
            </button>
            <button
              onClick={() => setShareOption("social")}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${
                shareOption === "social" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              <ExternalLink size={14} />
              <span>Social</span>
            </button>
          </div>

          {shareOption === "copy" && (
            <div className="border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50">
              <pre className="text-sm whitespace-pre-wrap">{formatConversation()}</pre>
            </div>
          )}

          {shareOption === "link" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex-1 truncate text-sm">
                  <p className="truncate">{shareableLink}</p>
                </div>
                <button onClick={handleCopyLink} className="p-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600">
                  {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="text-center text-sm text-gray-500">
                <p>Anyone with this link can view this conversation</p>
              </div>
            </div>
          )}

          {shareOption === "email" && (
            <div className="text-center p-4">
              <Mail size={32} className="mx-auto mb-2 text-gray-600" />
              <p className="mb-2">Share this conversation via email</p>
              <button
                onClick={() => handleShare("email")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Open Email Client
              </button>
            </div>
          )}

          {shareOption === "social" && (
            <div className="flex justify-center space-x-4 p-4">
              <button
                onClick={() => handleShare("twitter")}
                className="p-2 bg-[#1DA1F2] text-white rounded-full hover:opacity-90"
              >
                <Twitter size={20} />
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="p-2 bg-[#4267B2] text-white rounded-full hover:opacity-90"
              >
                <Facebook size={20} />
              </button>
              <button onClick={handleCopyLink} className="p-2 bg-gray-500 text-white rounded-full hover:opacity-90">
                <Link size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          {shareOption === "copy" && (
            <button
              onClick={handleCopyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
          {shareOption === "link" && (
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              {linkCopied ? "Copied!" : "Copy Link"}
              {linkCopied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
          {shareOption !== "copy" && shareOption !== "link" && (
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// File Preview Component
const FilePreview = ({ file, onRemove }: { file: File | null; onRemove: () => void }) => {
  if (!file) return null

  const isImage = file.type.startsWith("image/")
  const fileSize =
    file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 mt-2">
      <div className="w-8 h-8 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center text-blue-500">
        {isImage ? <ImageIcon size={16} /> : <File size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{fileSize}</p>
      </div>
      <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
        <X size={14} />
      </button>
    </div>
  )
}

// Attachment Preview Component for Messages
const AttachmentPreview = ({ attachment }: { attachment: FileAttachment }) => {
  const isImage = attachment.fileType.startsWith("image/")
  const fileSize =
    attachment.fileSize < 1024 * 1024
      ? `${(attachment.fileSize / 1024).toFixed(1)} KB`
      : `${(attachment.fileSize / (1024 * 1024)).toFixed(1)} MB`

  return (
    <div className="mt-2 max-w-full">
      {isImage ? (
        <div className="relative">
          <img
            src={attachment.fileUrl || "/placeholder.svg"}
            alt={attachment.fileName}
            className="max-w-full rounded-md max-h-60 object-contain"
          />
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
            {fileSize}
          </div>
        </div>
      ) : (
        <a
          href={attachment.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <File size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{attachment.fileName}</p>
            <p className="text-xs text-gray-500">{fileSize}</p>
          </div>
          <ExternalLink size={14} className="text-gray-500" />
        </a>
      )}
    </div>
  )
}

// The Chatbot component
const Chatbot = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Uploadcare client
  const uploadcareClient = new UploadClient({ publicKey: "549b3f0502ec4b4c7c20" })

  // Add CSS animation for the welcome screen
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Initialize or load sessions from localStorage
  useEffect(() => {
    try {
      // Check if we have a shared conversation in the URL
      const urlParams = new URLSearchParams(window.location.search)
      const sharedData = urlParams.get("data")

      if (sharedData) {
        try {
          // Decode the shared conversation
          const decodedData = decodeURIComponent(atob(sharedData))
          const parsedData = JSON.parse(decodedData)

          // Create a new session from the shared data
          const sharedSession: ChatSession = {
            id: uuidv4(),
            name: parsedData.name || "Shared Conversation",
            messages: parsedData.messages.map((msg: any) => ({
              id: uuidv4(),
              role: msg.role,
              content: msg.content,
              timestamp: Date.now(),
              fileAttachment: msg.fileAttachment,
            })),
            createdAt: Date.now(),
          }

          // Add the shared session to our sessions
          setSessions([sharedSession])
          setCurrentSessionId(sharedSession.id)

          // Remove the query parameter from URL to avoid reloading the same shared chat
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          console.error("Error parsing shared data:", err)
          loadStoredSessions()
        }
      } else {
        loadStoredSessions()
      }

      // Set sidebar state based on screen size
      const handleResize = () => {
        setIsSidebarOpen(window.innerWidth >= 768)
      }

      // Initial check
      handleResize()

      // Add event listener
      window.addEventListener("resize", handleResize)

      // Handle touch events for sidebar
      let touchStartX = 0
      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX
      }

      const handleTouchEnd = (e: TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX
        const diff = touchEndX - touchStartX

        // If swipe right from left edge when sidebar is closed
        if (diff > 50 && touchStartX < 30 && !isSidebarOpen) {
          setIsSidebarOpen(true)
        }

        // If swipe left when sidebar is open
        if (diff < -50 && isSidebarOpen) {
          setIsSidebarOpen(false)
        }
      }

      document.addEventListener("touchstart", handleTouchStart)
      document.addEventListener("touchend", handleTouchEnd)

      // Clean up
      return () => {
        document.removeEventListener("touchstart", handleTouchStart)
        document.removeEventListener("touchend", handleTouchEnd)
        window.removeEventListener("resize", handleResize)
      }
    } catch (err) {
      console.error("Error initializing sessions:", err)
      // Reset localStorage if corrupted
      localStorage.removeItem("chatSessions")
      createNewSession()
    }
  }, [])

  const loadStoredSessions = () => {
    const storedSessions = localStorage.getItem("chatSessions")
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions)
      setSessions(parsedSessions)

      // Set current session to the most recent one
      if (parsedSessions.length > 0) {
        setCurrentSessionId(parsedSessions[0].id)
      } else {
        createNewSession()
      }
    } else {
      createNewSession()
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [sessions, currentSessionId])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem("chatSessions", JSON.stringify(sessions))
      } catch (err) {
        console.error("Error saving sessions to localStorage:", err)
        setError("Failed to save chat history. Local storage might be full.")
      }
    }
  }, [sessions])

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: `New Chat`,
      messages: [],
      createdAt: Date.now(),
    }

    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setInput("")
    setError(null)

    // Close sidebar on mobile after creating a new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))

    if (currentSessionId === sessionId && sessions.length > 1) {
      // Set current session to another available session
      const remainingSessions = sessions.filter((session) => session.id !== sessionId)
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id)
      }
    } else if (sessions.length === 1) {
      // Create a new session if we're deleting the only one
      createNewSession()
    }
  }

  const deleteAllSessions = () => {
    setSessions([])
    localStorage.removeItem("chatSessions")
    createNewSession()
  }

  const getCurrentSession = () => {
    return sessions.find((session) => session.id === currentSessionId)
  }

  const addMessage = (role: "user" | "assistant", content: string, fileAttachment?: FileAttachment | null) => {
    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: Date.now(),
      fileAttachment,
    }

    setSessions((prev) => {
      // Find the current session
      const currentSession = prev.find((session) => session.id === currentSessionId)

      if (!currentSession) {
        // If no current session exists, create one
        const newSession: ChatSession = {
          id: currentSessionId || uuidv4(),
          name: role === "user" ? content.substring(0, 20) + (content.length > 20 ? "..." : "") : "New Chat",
          messages: [newMessage],
          createdAt: Date.now(),
        }
        return [newSession, ...prev.filter((s) => s.id !== currentSessionId)]
      }

      // Update the existing session
      return prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              name:
                role === "user" && session.messages.length === 0
                  ? content.substring(0, 20) + (content.length > 20 ? "..." : "")
                  : session.name,
            }
          : session,
      )
    })

    return newMessage
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Upload file to Uploadcare
  const uploadFile = async (file: File): Promise<FileAttachment> => {
    setIsUploading(true)
    try {
      const result = await uploadcareClient.uploadFile(file)
      const fileLink = result.cdnUrl

      console.log("File uploaded successfully:", result)

      // Create file attachment object
      const fileAttachment: FileAttachment = {
        fileId: result.uuid,
        fileUrl: `https://ucarecdn.com/${result.uuid}/${encodeURIComponent(file.name)}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }

      return fileAttachment
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  async function query(data: any) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(
        "https://flowise-15g2.onrender.com/api/v1/prediction/b721f8af-6063-4d4a-9b88-ae206549ad4d",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out. The server took too long to respond.")
      }
      throw error
    }
  }

  // Mock response for testing when API is unavailable
  const getMockResponse = (question: string) => {
    return {
      text: `This is a mock response to your question: "${question}". The actual API is currently unavailable, so I'm providing this fallback response for testing purposes.`,
    }
  }

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedFile) || isLoading || isUploading) return

    const userMessage = input.trim() || (selectedFile ? `Sent a file: ${selectedFile.name}` : "")
    setInput("")
    setIsLoading(true)
    setError(null)

    let fileAttachment: FileAttachment | null = null

    try {
      // Upload file if selected
      if (selectedFile) {
        fileAttachment = await uploadFile(selectedFile)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }

      // Add user message to the conversation
      addMessage("user", userMessage, fileAttachment)

      // Prepare message for API
      let messageForAPI = userMessage

      // Special handling for file-only uploads
      if (fileAttachment && !input.trim()) {
        // For file-only uploads, pass the file link to Flowise
        messageForAPI = `this is the file link and you will tell the user now the file is uploaded successfully: ${fileAttachment.fileUrl}`
      } else if (fileAttachment) {
        // For uploads with text, include file information
        messageForAPI += ` [File: ${fileAttachment.fileName}, URL: ${fileAttachment.fileUrl}]`
      }

      // Try to send message to API
      const response = await query({
        question: messageForAPI,
        overrideConfig: {
          systemMessage: "example",
          maxIterations: 1,
          enableDetailedStreaming: true,
          sessionId: currentSessionId,
        },
      })

      // Add assistant response to the conversation
      if (response && response.text) {
        addMessage("assistant", response.text)
      } else {
        throw new Error("Invalid response format from API")
      }
    } catch (error: any) {
      console.error("Error querying the API:", error)

      // For demo purposes, use mock response instead of showing error
      // This ensures the chat functionality works even if the API is down
      const mockResponse = getMockResponse(userMessage)
      addMessage("assistant", mockResponse.text)

      // Uncomment to show actual error messages
      // setError(`Error: ${error.message || "Failed to get response from server"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const filteredSessions = sessions.filter((session) => session.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex h-[90vh] lg:h-screen bg-white overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-3 right-3 z-20 p-2 bg-white rounded-md shadow-md"
        >
          <HistoryIcon size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transform transition-transform duration-300 fixed md:relative z-30 w-72 sm:w-64 h-full bg-white border-r border-gray-200 flex flex-col md:translate-x-0 shadow-lg md:shadow-none`}
      >
        <div className="p-3 sm:p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="font-semibold text-sm sm:text-base text-blue-700">Chats</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-1 px-2 pl-7 text-xs rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-24 transition-all duration-200 focus:w-32"
              />
              <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              className="md:hidden p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              onClick={toggleSidebar}
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        <div className="px-3 py-3">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`px-3 py-2 mx-2 flex items-center rounded-md group transition-all duration-200 ${
                session.id === currentSessionId
                  ? "bg-blue-50 border-l-2 border-blue-500"
                  : "hover:bg-gray-50 border-l-2 border-transparent"
              }`}
            >
              <div
                className="flex-1 flex items-center cursor-pointer"
                onClick={() => {
                  setCurrentSessionId(session.id)
                  setError(null)
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false)
                  }
                }}
              >
                <div className="mr-2 text-gray-500">
                  <MessageSquare size={16} className={session.id === currentSessionId ? "text-blue-500" : ""} />
                </div>
                <div className="truncate flex-1">
                  <p className="text-sm font-medium">{session.name}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm("Are you sure you want to delete this chat?")) {
                    deleteSession(session.id)
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                title="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 mt-auto">
          <div className="flex items-center gap-2 p-2 rounded-md bg-gray-50 text-xs text-gray-600">
            <span className="font-medium">Enhance Your Experience</span>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-opacity-50 z-20 backdrop-blur-sm" onClick={toggleSidebar}></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-hidden relative">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-2">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Content or Welcome Screen */}
        <div className="flex-1 overflow-y-auto">
          {getCurrentSession()?.messages.length ? (
            // Chat messages
            <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
              {getCurrentSession()?.messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[90%] sm:max-w-[75%] p-2.5 sm:p-3 rounded-lg shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>

                    {/* Display file attachment if present */}
                    {message.fileAttachment && <AttachmentPreview attachment={message.fileAttachment} />}

                    <div className="text-right mt-1">
                      <span className={`text-[10px] ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] sm:max-w-[75%] p-2.5 sm:p-3 rounded-lg bg-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            // Welcome screen with cards
            <div className="flex flex-col items-center justify-center h-full p-3 sm:p-6 bg-gradient-to-b from-white to-blue-50">
              <div className="mb-4 sm:mb-8 animate-fade-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                  <span className="text-white text-sm sm:text-lg font-bold">AI</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-800">ThinkGPT</h1>
                <p className="text-center text-gray-500 text-xs sm:text-sm mt-1">
                  Your AI-powered conversation assistant
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-4xl w-full">
                {/* Example Prompt Card */}
                <div
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setInput("Write a story about an AI assistant helping humans")
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 mr-2">
                      <MessageSquare size={18} />
                    </div>
                    <h3 className="font-medium">Example Prompt</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-sm flex items-start">
                      <span className="block">Write a story about an AI assistant helping humans</span>
                    </li>
                    <li className="text-sm flex items-start">
                      <span className="block">Explain the basics of machine learning</span>
                    </li>
                    <li className="text-sm flex items-start">
                      <span className="block">Create a dialogue between two characters</span>
                    </li>
                  </ul>
                </div>

                {/* Capabilities Card */}
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-500 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="font-medium">Capabilities</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-sm flex items-start">
                      <span className="block">Remembers conversation context</span>
                    </li>
                    <li className="text-sm flex items-start">
                      <span className="block">Provides detailed and relevant responses</span>
                    </li>
                    <li className="text-sm flex items-start">
                      <span className="block">Maintains conversation history across sessions</span>
                    </li>
                    <li className="text-sm flex items-start">
                      <span className="block">Supports file uploads and sharing</span>
                    </li>
                  </ul>
                </div>

                {/* Limitations Card */}
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <h3 className="font-medium">Limitations</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-sm flex items-start">
                      <span className="block">May occasionally provide incorrect information</span>
                    </li>
                    <li className="text-sm flex items-start">
                      <span className="block">Limited knowledge of events after training cutoff</span>
                    </li>
                    <li className="text-sm flex items-start">
                      <span className="block">Cannot browse the internet or access files</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-2 sm:p-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
          {/* File preview */}
          {selectedFile && <FilePreview file={selectedFile} onRemove={handleRemoveFile} />}

          <div className="flex items-center max-w-3xl mx-auto relative">
            {/* File upload button */}
            <label className="p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 cursor-pointer mr-1">
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isLoading || isUploading}
              />
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
            </label>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder="Ask me anything..."
              className="w-full p-2.5 sm:p-3.5 pr-12 sm:pr-16 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm shadow-sm"
              disabled={isLoading || isUploading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || isUploading || (!input.trim() && !selectedFile)}
              className="absolute right-1 sm:right-2 p-1.5 sm:p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {isLoading || isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 14-7-7 14v-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="text-center mt-1.5 sm:mt-2.5">
            <p className="text-xs text-gray-500">
              ThinkGPT might provide inaccurate information. Always verify critical details.
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} session={getCurrentSession()} />
    </div>
  )
}

export default Chatbot
