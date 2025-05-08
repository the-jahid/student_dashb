// API functions for interacting with Flowise
export async function query(data: {
    question: string
    overrideConfig?: {
      systemMessage?: string
      maxIterations?: number
      enableDetailedStreaming?: boolean
      sessionId?: string
    }
  }) {
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
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
      if (error.name === "AbortError") {
        return {
          text: "Request timed out. The server took too long to respond.",
        }
      }
  
      console.error("Error querying Flowise API:", error)
      return {
        text: `Error: ${error.message || "Something went wrong with the request."}`,
      }
    }
  }
  