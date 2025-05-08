"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { loadConversations } from "@/lib/storage"
import type { Conversation, Message } from "@/types"

export default function SharedConversation() {
  const params = useParams()
  const conversationId = params?.id as string
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to load the conversation from localStorage first (for the owner)
    const storedConversations = loadConversations()
    const foundConversation = storedConversations.find((conv) => conv.id === conversationId)

    if (foundConversation) {
      setConversation(foundConversation)
      setLoading(false)
    } else {
      // If not found locally, we would typically fetch from an API
      // For now, we'll just show an error since we don't have a backend
      setError("Conversation not found. This link may be invalid or the conversation has been deleted.")
      setLoading(false)
    }
  }, [conversationId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Conversation Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "This conversation could not be loaded."}</p>
          <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 rounded-md hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-medium">{conversation.title || "Shared Conversation"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">Shared conversation from Aria</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {conversation.messages.map((message: Message) =>
          message.isUser ? (
            /* User Message */
            <div key={message.id} className="flex justify-end mb-6">
              <div className="max-w-[80%]">
                <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                  <p>{message.content}</p>
                </div>
                <div className="flex justify-end">
                  <div className="w-6 h-6 rounded-full overflow-hidden mt-1">
                    <Image
                      src="/placeholder.svg?height=24&width=24"
                      alt="User"
                      width={24}
                      height={24}
                      className="bg-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* AI Message */
            <div key={message.id} className="flex gap-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                    fill="black"
                  />
                  <path
                    d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                    fill="black"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p>{message.content}</p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="text-center text-xs text-gray-500">
          This is a shared conversation from Aria, the study abroad assistant.
          <Link href="/" className="text-blue-500 ml-1">
            Try Aria for yourself
          </Link>
        </div>
      </div>
    </div>
  )
}
