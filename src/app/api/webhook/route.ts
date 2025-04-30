export async function POST(request: Request) {
    try {
      const { fileUrl } = await request.json()
  
      if (!fileUrl) {
        return new Response(JSON.stringify({ error: "File URL is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
  
      // Send the file URL to the webhook
      const webhookUrl = "https://hook.eu2.make.com/a9i6rnil24lftz8bpihlhs9ujy75n6of"
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
      })
  
      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`)
      }
  
      const webhookResponse = await response.json()
      return new Response(JSON.stringify({ success: true, data: webhookResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("Error sending to webhook:", error)
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  }
  