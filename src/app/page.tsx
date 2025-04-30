import Link from "next/link"
import { BotIcon, File, Globe, Home, Upload, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/Header/header"
import { SignedIn } from "@clerk/nextjs"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="bg-red-300" >
        {/* Hero Section */}
        <section className="w-full  py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32  bg-gradient-to-b from-background to-muted ">
          <div className=" px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                    AI-Powered Student Counseling
                  </h1>
                  <p className="max-w-[600px] text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
                    Guide students through program selection, application processes, and more with our intelligent
                    chatbot system.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <SignedIn>
                  <Link href="/dashboard/chatbot" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full">
                      Start Counseling
                    </Button>
                  </Link>
                  <Link href="/dashboard/file" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full">
                      Upload Program Data
                    </Button>
                  </Link>
                  </SignedIn>
                </div>
              </div>
              <div className="flex justify-center mt-6 lg:mt-0">
                <div className="relative w-full max-w-[500px] h-[300px] sm:h-[350px] md:h-[400px] rounded-lg overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border">
                    <div className="absolute top-4 left-4 right-4 h-8 sm:h-10 bg-background/80 backdrop-blur-sm rounded-md flex items-center px-4 border">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 mr-2"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 mr-2"></div>
                      <div className="flex-1 text-xs text-center">EduCounsel AI Chat</div>
                    </div>
                    <div className="absolute top-14 sm:top-16 bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-md p-3 sm:p-4 overflow-y-auto border">
                      <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 p-1 sm:p-2 rounded-lg">
                            <BotIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div className="bg-muted p-2 sm:p-3 rounded-lg text-xs sm:text-sm max-w-[80%]">
                            Hello! I'm your educational counselor. How can I help you today?
                          </div>
                        </div>
                        <div className="flex items-start gap-2 justify-end">
                          <div className="bg-primary p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-primary-foreground max-w-[80%]">
                            I'm interested in studying computer science abroad.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 p-1 sm:p-2 rounded-lg">
                            <BotIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div className="bg-muted p-2 sm:p-3 rounded-lg text-xs sm:text-sm max-w-[80%]">
                            Great choice! I can help you explore computer science programs. Which country are you
                            interested in?
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 bg-background">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">Powerful Features</h2>
                <p className="max-w-[900px] text-sm sm:text-base md:text-lg text-muted-foreground">
                  Everything you need to provide effective student counseling and track applications
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Multi-Language Support</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Communicate with students in their preferred language using ChatGPT integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Break language barriers and provide counseling to international students with automatic translation
                    capabilities.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-2">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Bulk Information Upload</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Easily upload program information with CSV files</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Keep your program database up-to-date by uploading information in bulk and customize counseling
                    workflows.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-2">
                  <File className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Document Collection</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Collect and store student documents securely</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Gather transcripts, recommendation letters, and other application materials in one organized
                    location.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Lead Tracking</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monitor student applications and follow-up opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Track student interactions, application progress, and identify follow-up opportunities to increase
                    conversion.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-2">
                  <BotIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Conversational Counseling</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Natural dialogue-based guidance for students</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Provide personalized advice through natural conversations that adapt to each student's needs and
                    questions.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-2">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Customizable Workflows</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Tailor the counseling process to your institution</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Design conversation flows that match your programs, requirements, and application processes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 bg-muted">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-sm sm:text-base md:text-lg text-muted-foreground">
                  Simple steps to transform your student counseling process
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg sm:text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Upload Program Data</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Import your program information, requirements, and application processes using our CSV upload tool.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg sm:text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Customize Your Chatbot</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Configure conversation flows, response templates, and data collection fields to match your needs.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg sm:text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Connect With Students</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Embed the chatbot on your website or share a direct link to start counseling students instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 bg-primary text-primary-foreground">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                  Ready to Transform Student Counseling?
                </h2>
                <p className="max-w-[900px] text-sm sm:text-base md:text-lg">
                  Start using our AI-powered solution today and provide better guidance to prospective students.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard/chatbot" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="#features" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full border-primary-foreground">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 md:py-12 bg-background border-t">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <BotIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-lg sm:text-xl font-bold">EduCounsel AI</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                AI-powered student counseling solution for educational institutions.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-medium">Navigation</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link href="/" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/chatbot" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    Chat
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/file" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    File Upload
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-medium">Contact</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li className="text-xs sm:text-sm text-muted-foreground">Email: contact@educounselai.com</li>
                <li className="text-xs sm:text-sm text-muted-foreground">Phone: +1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} EduCounsel AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}