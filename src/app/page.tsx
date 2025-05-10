"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Copy, RefreshCw, Trash2, SparklesIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import LanguageSelector from "@/components/language-selector"
import LanguageSwitcher from "@/components/language-switcher"
import ShareDialog from "@/components/share-dialog"
import FileUploadButton from "@/components/file-upload-button"
import FileAttachmentPreview from "@/components/file-attachment-preview"
import Sidebar from "@/components/sidebar"
import { query } from "@/lib/api"
import {
  saveConversations,
  loadConversations,
  saveActiveConversation,
  loadActiveConversation,
  savePinnedConversations,
  loadPinnedConversations,
} from "@/lib/storage"
import { useLanguage } from "@/contexts/language-context"
import type { Message, Language, Conversation, FileAttachment } from "@/types"
import { useUser } from "@clerk/nextjs"

// Available languages
const languages: Language[] = [
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
]

// Welcome messages in different languages
const welcomeMessages: Record<string, string> = {
  ar: "مرحبًا، أنا آريا، مساعدك الشخصي للتقديم للجامعات. كيف يمكنني مساعدتك في العثور على الجامعة والبرنامج المناسب لك؟",
  en: "Hello, I'm Aria, your personal university application assistant. How can I help you find the right university and program for you?",
  fr: "Bonjour, je suis Aria, votre assistant personnel pour les candidatures universitaires. Comment puis-je vous aider à trouver l'université et le programme qui vous conviennent ?",
  pt: "Olá, eu sou Aria, seu assistente pessoal para candidaturas universitárias. Como posso ajudá-lo a encontrar a universidade e o programa certos para você?",
  nl: "Hallo, ik ben Aria, je persoonlijke assistent voor universitaire aanmeldingen. Hoe kan ik je helpen bij het vinden van de juiste universiteit en het juiste programma voor jou?",
  fa: "سلام، من آریا هستم، دستیار شخصی شما برای درخواست دانشگاه. چگونه می‌توانم به شما در یافتن دانشگاه و برنامه مناسب کمک کنم؟",
  es: "Hola, soy Aria, tu asistente personal para solicitudes universitarias. ¿Cómo puedo ayudarte a encontrar la universidad y el programa adecuados para ti?",
  it: "Ciao, sono Aria, il tuo assistente personale per le domande universitarie. Come posso aiutarti a trovare l'università e il programma giusti per te?",
  zh: "你好，我是Aria，你的大学申请个人助手。我能如何帮助你找到适合你的大学和专业？",
  ja: "こんにちは、私はアリアです。あなたの大学出願パーソナルアシスタントです。あなたに合った大学とプログラムを見つけるお手伝いをどのようにできますか？",
  hi: "नमस्ते, मैं आरिया हूँ, आपका विश्वविद्यालय आवेदन व्यक्तिगत सहायक। मैं आपको सही विश्वविद्यालय और कार्यक्रम खोजने में कैसे मदद कर सकता हूँ?",
  ko: "안녕하세요, 저는 아리아입니다. 대학 지원을 위한 개인 비서입니다. 적합한 대학과 프로그램을 찾는 데 어떻게 도와드릴까요?",
}

// Template suggestions for university applications
const templateSuggestions: Record<string, { icon: string; text: string }[]> = {
  en: [
    { icon: "🎓", text: "Find top universities for my major" },
    { icon: "💰", text: "Scholarships and financial aid options" },
    { icon: "📝", text: "Help with my personal statement" },
    { icon: "📋", text: "Application requirements for universities" },
  ],
  ar: [
    { icon: "🎓", text: "ابحث عن أفضل الجامعات لتخصصي" },
    { icon: "💰", text: "خيارات المنح الدراسية والمساعدات المالية" },
    { icon: "📝", text: "المساعدة في كتابة بياني الشخصي" },
    { icon: "📋", text: "متطلبات التقديم للجامعات" },
  ],
  fr: [
    { icon: "🎓", text: "Trouver les meilleures universités pour ma spécialité" },
    { icon: "💰", text: "Options de bourses et d'aide financière" },
    { icon: "📝", text: "Aide pour ma lettre de motivation" },
    { icon: "📋", text: "Conditions de candidature pour les universités" },
  ],
  pt: [
    { icon: "🎓", text: "Encontrar as melhores universidades para minha especialidade" },
    { icon: "💰", text: "Opções de bolsas de estudo e ajuda financeira" },
    { icon: "📝", text: "Ajuda com minha carta de motivação" },
    { icon: "📋", text: "Requisitos de inscrição para universidades" },
  ],
  nl: [
    { icon: "🎓", text: "Vind de beste universiteiten voor mijn studie" },
    { icon: "💰", text: "Beurzen en financiële hulpopties" },
    { icon: "📝", text: "Hulp bij mijn motivatiebrief" },
    { icon: "📋", text: "Aanmeldingsvereisten voor universiteiten" },
  ],
  es: [
    { icon: "🎓", text: "Encontrar las mejores universidades para mi carrera" },
    { icon: "💰", text: "Opciones de becas y ayuda financiera" },
    { icon: "📝", text: "Ayuda con mi carta de motivación" },
    { icon: "📋", text: "Requisitos de solicitud para universidades" },
  ],
  it: [
    { icon: "🎓", text: "Trovare le migliori università per il mio corso di laurea" },
    { icon: "💰", text: "Opzioni di borse di studio e aiuti finanziari" },
    { icon: "📝", text: "Aiuto con la mia lettera motivazionale" },
    { icon: "📋", text: "Requisiti di domanda per le università" },
  ],
  zh: [
    { icon: "🎓", text: "为我的专业寻找顶尖大学" },
    { icon: "💰", text: "奖学金和经济援助选项" },
    { icon: "📝", text: "帮助我写个人陈述" },
    { icon: "📋", text: "大学申请要求" },
  ],
  ja: [
    { icon: "🎓", text: "私の専攻のためのトップ大学を探す" },
    { icon: "💰", text: "奨学金と経済的支援のオプション" },
    { icon: "📝", text: "志望動機書の作成サポート" },
    { icon: "📋", text: "大学の出願要件" },
  ],
  hi: [
    { icon: "🎓", text: "मेरे विषय के लिए शीर्ष विश्वविद्यालय खोजें" },
    { icon: "💰", text: "छात्रवृत्ति और वित्तीय सहायता विकल्प" },
    { icon: "📝", text: "मेरे व्यक्तिगत विवरण में मदद" },
    { icon: "📋", text: "विश्वविद्यालयों के लिए आवेदन आवश्यकताएँ" },
  ],
  ko: [
    { icon: "🎓", text: "내 전공을 위한 최고의 대학 찾기" },
    { icon: "💰", text: "장학금 및 재정 지원 옵션" },
    { icon: "📝", text: "자기소개서 작성 도움" },
    { icon: "📋", text: "대학 지원 요건" },
  ],
  fa: [
    { icon: "🎓", text: "یافتن بهترین دانشگاه‌ها برای رشته من" },
    { icon: "💰", text: "گزینه‌های بورسیه و کمک مالی" },
    { icon: "📝", text: "کمک با نامه انگیزه‌نامه من" },
    { icon: "📋", text: "الزامات درخواست برای دانشگاه‌ها" },
  ],
}

export default function ChatInterface() {
  const { language, setLanguage, t } = useLanguage()
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(true)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [pendingFileAttachment, setPendingFileAttachment] = useState<FileAttachment | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useUser()
  // State for conversations
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([])

  // Add this near the top of your component, after the state declarations
  const initialConversationCreated = useRef(false)

  // Get the active conversation
  const activeConversation = conversations.find((conv) => conv.id === activeConversationId) || null

  // Add a ref for the chat container
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Add this useEffect to scroll to the bottom of the chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [activeConversation?.messages])

  // Load conversations from localStorage on initial render
  useEffect(() => {
    const storedConversations = loadConversations()
    const storedPinnedConversations = loadPinnedConversations()

    if (storedConversations.length > 0) {
      setConversations(storedConversations)
      setPinnedConversations(storedPinnedConversations)

      // Load active conversation
      const storedActiveId = loadActiveConversation()
      if (storedActiveId && storedConversations.some((conv) => conv.id === storedActiveId)) {
        setActiveConversationId(storedActiveId)
        setShowLanguageSelector(false)

        // Set the language from the active conversation
        const activeConv = storedConversations.find((conv) => conv.id === storedActiveId)
        if (activeConv) {
          setLanguage(activeConv.language)
        }
      } else {
        // Load language preference from localStorage
        const storedLanguage = localStorage.getItem("aria-language")
        if (storedLanguage) {
          setLanguage(storedLanguage)
        }
      }
    } else {
      // Load language preference from localStorage
      const storedLanguage = localStorage.getItem("aria-language")
      if (storedLanguage) {
        setLanguage(storedLanguage)
      }
    }
  }, [setLanguage])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations)
    }
  }, [conversations])

  // Save pinned conversations to localStorage whenever they change
  useEffect(() => {
    savePinnedConversations(pinnedConversations)
  }, [pinnedConversations])

  // Save active conversation ID whenever it changes
  useEffect(() => {
    saveActiveConversation(activeConversationId)
  }, [activeConversationId])

  // Initialize chat with welcome message after language selection
  useEffect(() => {
    if (language && !activeConversationId && !showLanguageSelector && !initialConversationCreated.current) {
      initialConversationCreated.current = true
      // Create a new conversation
      createNewConversation(language)
    }
  }, [language, activeConversationId, showLanguageSelector])

  // Create a new conversation
  const createNewConversation = (langCode: string) => {
    const conversationId = uuidv4()
    const welcomeMessage = welcomeMessages[langCode] || welcomeMessages.en

    const newConversation: Conversation = {
      id: conversationId,
      title: "New Conversation",
      language: langCode,
      messages: [
        {
          id: "welcome",
          content: welcomeMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setConversations((prev) => [...prev, newConversation])
    setActiveConversationId(conversationId)

    // Setup language with the API
    const languageSetupPrompt = `Please communicate with me in ${languages.find((l) => l.code === langCode)?.name} language from now on. I'm looking for help with university applications.`

    query({
      question: languageSetupPrompt,
      overrideConfig: {
        sessionId: conversationId,
      },
    }).catch((error) => {
      console.error("Error setting up language:", error)
    })
  }

  // Handle language selection
  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode)
    setShowLanguageSelector(false)
    initialConversationCreated.current = false // Reset this so a new conversation can be created
  }

  // Switch to a conversation
  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find((conv) => conv.id === conversationId)
    if (conversation) {
      setActiveConversationId(conversationId)
      setLanguage(conversation.language)
    }
  }

  // Delete a conversation
  const deleteConversation = (conversationId: string) => {
    // Remove from pinned conversations if it's pinned
    if (pinnedConversations.includes(conversationId)) {
      setPinnedConversations((prev) => prev.filter((id) => id !== conversationId))
    }

    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

    // If the active conversation is deleted, set active to null
    if (activeConversationId === conversationId) {
      setActiveConversationId(null)

      // If there are other conversations, set the first one as active
      const remainingConversations = conversations.filter((conv) => conv.id !== conversationId)
      if (remainingConversations.length > 0) {
        setActiveConversationId(remainingConversations[0].id)
        setLanguage(remainingConversations[0].language)
      } else {
        // If no conversations left, show language selector
        setShowLanguageSelector(true)
      }
    }
  }

  // Rename a conversation
  const renameConversation = (conversationId: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              title: newTitle,
              updatedAt: new Date(),
            }
          : conv,
      ),
    )
  }

  // Toggle pin status of a conversation
  const togglePinConversation = (conversationId: string) => {
    if (pinnedConversations.includes(conversationId)) {
      // Unpin the conversation
      setPinnedConversations((prev) => prev.filter((id) => id !== conversationId))
    } else {
      // Pin the conversation
      setPinnedConversations((prev) => [...prev, conversationId])
    }
  }

  // Start a new chat
  const startNewChat = () => {
    setShowLanguageSelector(true)
    setActiveConversationId(null)
    initialConversationCreated.current = false // Reset this so a new conversation can be created
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleFileUpload = (fileAttachment: FileAttachment) => {
    setPendingFileAttachment(fileAttachment)

    // Automatically send a message with the file if no input text
    if (!inputValue.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleSubmit(new Event("submit") as any, fileAttachment)
    }
  }

  const handleSubmit = async (e: React.FormEvent, fileAttachment: FileAttachment | null = pendingFileAttachment) => {
    e.preventDefault()
    if ((!inputValue.trim() && !fileAttachment) || !activeConversationId || isGenerating) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || t("fileUploaded"),
      isUser: true,
      timestamp: new Date(),
      fileAttachment: fileAttachment || undefined,
    }

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              // Update title if this is the first user message
              title:
                conv.title === "New Conversation" && conv.messages.length <= 1
                  ? (inputValue || fileAttachment?.fileName || "New Conversation").substring(0, 30) +
                    ((inputValue || fileAttachment?.fileName || "").length > 30 ? "..." : "")
                  : conv.title,
              updatedAt: new Date(),
            }
          : conv,
      ),
    )

    setInputValue("")
    setPendingFileAttachment(null)
    setIsGenerating(true)

    try {
      // Prepare the question with file information if present
      let question = inputValue
      if (fileAttachment) {
        if (!inputValue.trim()) {
          // If there's no text input but there's a file, send a specific message format
          question = `this is the file link and you will tell the user now the file is uploaded successfully: ${fileAttachment.fileUrl}`
        } else {
          // If there's both text and file, include file info with the message
          question = `${question} (File attached: ${fileAttachment.fileName}, URL: ${fileAttachment.fileUrl})`
        }
      }

      // Send message to API with session ID
      const response = await query({
        question,
        overrideConfig: {
          sessionId: activeConversationId,
        },
      })

      // Prepare AI response content
      let responseContent = response.text || "I'm sorry, I couldn't process that request."

      // For file-only uploads, the AI will already respond with a success message
      // We'll only add our own prefix if the AI response doesn't already mention the file
      if (fileAttachment && !inputValue.trim() && !responseContent.includes("file")) {
        responseContent = `${t("fileReceived")}${fileAttachment.fileName}\n\n${responseContent}`
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
      }

      // Update conversation with AI message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, aiMessage],
                updatedAt: new Date(),
              }
            : conv,
        ),
      )
    } catch (error) {
      console.error("Error querying API:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }

      // Update conversation with error message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                updatedAt: new Date(),
              }
            : conv,
        ),
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTemplateClick = async (template: string) => {
    if (!activeConversationId) return

    setInputValue(template)

    // Automatically submit the template
    const userMessage: Message = {
      id: Date.now().toString(),
      content: template,
      isUser: true,
      timestamp: new Date(),
    }

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              // Update title if this is the first user message
              title:
                conv.title === "New Conversation" && conv.messages.length <= 1
                  ? template.substring(0, 30) + (template.length > 30 ? "..." : "")
                  : conv.title,
              updatedAt: new Date(),
            }
          : conv,
      ),
    )

    setIsGenerating(true)

    try {
      // Send message to API with session ID
      const response = await query({
        question: template,
        overrideConfig: {
          sessionId: activeConversationId,
        },
      })

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.text || "I'm sorry, I couldn't process that request.",
        isUser: false,
        timestamp: new Date(),
      }

      // Update conversation with AI message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, aiMessage],
                updatedAt: new Date(),
              }
            : conv,
        ),
      )
    } catch (error) {
      console.error("Error querying API:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }

      // Update conversation with error message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                updatedAt: new Date(),
              }
            : conv,
        ),
      )
    } finally {
      setIsGenerating(false)
      setInputValue("")
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversationId) return

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: conv.messages.filter((msg) => msg.id !== messageId),
              updatedAt: new Date(),
            }
          : conv,
      ),
    )
  }

  const handleRegenerateResponse = async () => {
    if (!activeConversationId) return

    // Find the last user message in the active conversation
    const conversation = conversations.find((conv) => conv.id === activeConversationId)
    if (!conversation) return

    const lastUserMessage = [...conversation.messages].reverse().find((message) => message.isUser)
    if (!lastUserMessage) return

    setIsGenerating(true)

    try {
      // Prepare the question with file information if present
      let question = lastUserMessage.content
      if (lastUserMessage.fileAttachment) {
        question = `${question} (File attached: ${lastUserMessage.fileAttachment.fileName})`
      }

      // Re-send the last user message to the API with session ID
      const response = await query({
        question,
        overrideConfig: {
          sessionId: activeConversationId,
        },
      })

      // Add new AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response.text || "I'm sorry, I couldn't process that request.",
        isUser: false,
        timestamp: new Date(),
      }

      // Update conversation with new AI message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, aiMessage],
                updatedAt: new Date(),
              }
            : conv,
        ),
      )
    } catch (error) {
      console.error("Error regenerating response:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, there was an error regenerating a response. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }

      // Update conversation with error message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                updatedAt: new Date(),
              }
            : conv,
        ),
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle share button click
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleShareClick = () => {
    if (activeConversation) {
      setShowShareDialog(true)
    }
  }

  // If language selector is shown, render only that
  if (showLanguageSelector) {
    return <LanguageSelector languages={languages} onSelectLanguage={handleLanguageSelect} />
  }

  // Get messages from active conversation
  const messages = activeConversation ? activeConversation.messages : []

  return (
    <div className="flex h-[95vh] lg:h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        pinnedConversations={pinnedConversations}
        activeConversationId={activeConversationId}
        onNewChat={startNewChat}
        onSelectConversation={switchConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        onTogglePinConversation={togglePinConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="hidden lg:inline" >
        <div className="flex items-center justify-between p-4 border-b border-gray-200   ">
          <div className="flex items-center gap-2 ml-14 lg:ml-0">
            <LanguageSwitcher languages={languages} />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1 text-sm border border-red-200 text-red-500 rounded-md"
              onClick={() => activeConversationId && deleteConversation(activeConversationId)}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t("delete")}</span>
            </button>
          </div>
        </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-[#f5f6fa] p-4" ref={chatContainerRef}>
          {messages.length <= 1 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 mx-auto">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <h2 className="text-xl font-semibold text-center">Aria</h2>
                <p className="text-center text-gray-500 mt-2">{t("startWithTask")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {(templateSuggestions[language] || templateSuggestions.en).map((template, index) => (
                  <button
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
                    onClick={() => handleTemplateClick(template.text)}
                  >
                    <span className="text-xl">{template.icon}</span>
                    <span className="text-sm">{template.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) =>
                message.isUser ? (
                  <div key={message.id} className="flex justify-end mb-6">
                    <div className="max-w-[80%]  flex justify-center items-center space-x-2 ">
                      <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                        <p>{message.content}</p>

                        {message.fileAttachment && (
                          <div className="mt-2 max-w-xs">
                            <FileAttachmentPreview fileAttachment={message.fileAttachment} showRemoveButton={false} />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <div className="w-6 h-6 rounded-full overflow-hidden mt-1">
                          <Image
                            src={user?.imageUrl || "/default-avatar.png"}
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
                    <div className="flex-1 ">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>
                      <div className="flex gap-2 mt-2 lg:bg-white p-2 lg:w-2/12 rounded-lg justify-center ">
                        <button className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                          <Copy className="w-3 h-3" />
                          <span>{t("copy")}</span>
                        </button>
                        <button
                          className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer"
                          onClick={handleRegenerateResponse}
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t("regenerate")}</span>
                        </button>
                        <button
                          className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t("delete")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )}

              {isGenerating && (
                <div className="flex gap-3">
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
                    <div className="inline-flex items-center justify-center bg-white p-2 rounded-lg shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                        <div
                          className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-[#f5f6fa] p-4 ">
          <form onSubmit={handleSubmit} className="relative">
            {/* Pending file attachment preview */}
            {pendingFileAttachment && (
              <div className="mb-2">
                <FileAttachmentPreview
                  fileAttachment={pendingFileAttachment}
                  onRemove={() => setPendingFileAttachment(null)}
                />
              </div>
            )}

            <div className="flex items-center">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <FileUploadButton onFileUpload={handleFileUpload} disabled={isGenerating || isUploading} />
              </div>

              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={t("Ask me anything")}
                className="w-full pl-12 pr-24 py-3  bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isGenerating || isUploading}
              />

              <button
                type="submit"
                className={`
        absolute right-2 top-1/2 transform -translate-y-1/2 /* Keep if positioning is needed */
        px-2 py-2 /* Adjusted padding for a slightly larger feel like the image */
        rounded-lg cursor-pointer /* For pill-shaped button */
        font-semibold /* Text looks a bit bolder in the image */
        text-white
        flex items-center justify-center gap-2 /* Adjusted gap */
        transition-all duration-300 ease-in-out /* Smooth transitions */
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 /* Focus state */
        ${
          isGenerating || isUploading
            ? "bg-gradient-to-r from-gray-500 to-gray-400 cursor-not-allowed opacity-70" /* Disabled/loading gradient */
            : "bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400 hover:from-blue-600 hover:via-purple-600 hover:to-teal-500" /* Active gradient with hover */
        }
    `}
                disabled={isGenerating || isUploading || (!inputValue.trim() && !pendingFileAttachment)}
              >
                {isGenerating || isUploading ? (
                  <>
                    <span>Generating...</span>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Generate</span>
                    <SparklesIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          <div className="text-center text-xs text-gray-500 mt-2">
            {t("disclaimer")}
            <Link href="#" className="text-blue-500 ml-1">
              {t("verifyDetails")}
            </Link>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && activeConversation && (
        <ShareDialog conversation={activeConversation} onClose={() => setShowShareDialog(false)} />
      )}
    </div>
  )
}
