'use client'
import React, { useEffect } from 'react'
import { Table } from "@/components/table"
import { Card } from "@/components/ui/card"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from "@/components/header"
import { ChevronRight, CirclePlay, Zap, Users, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function HeroSection() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/boards');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If signed in, return null (waiting for redirect) or loading
  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeroHeader />
      <main className="overflow-hidden flex-1">
        <section className="bg-linear-to-b to-muted from-background pt-24 pb-12 lg:pt-36 lg:pb-24">
          <div className="relative">
            <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
              <div className="md:w-1/2">
                <div>
                  <h1 className="max-w-md text-balance text-5xl font-medium md:text-6xl tracking-tight">
                    Manage Tasks with Your Team <span className="text-primary">In Real-Time</span>
                  </h1>
                  <p className="text-muted-foreground my-8 max-w-2xl text-balance text-xl">
                    A powerful task management platform that helps teams collaborate, organize work, and track progress seamlessly.
                  </p>

                  <div className="flex items-center gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="pr-4.5 gap-1">
                      <Link href="/sign-up">
                        <span className="text-nowrap">Get Started</span>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </Link>
                    </Button>
                    <Button
                      key={2}
                      asChild
                      size="lg"
                      variant="outline"
                      className="pl-5 gap-2">
                      <Link href="#demo">
                        <CirclePlay className="h-4 w-4 fill-primary/10 stroke-primary" />
                        <span className="text-nowrap">Watch demo</span>
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-10">
                  <p className="text-muted-foreground text-sm font-medium">Trusted by teams at :</p>
                  <div className="mt-4 flex gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <div className="h-6 w-6 bg-foreground rounded-full"></div> Acme Inc.
                    </div>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <div className="h-6 w-6 bg-foreground rounded-full"></div> Globex
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="perspective-near mt-12 translate-x-12 md:absolute md:-right-6 md:bottom-auto md:top-20 md:left-1/2 md:mt-0 md:translate-x-0 w-full max-w-3xl">
              <div className="before:border-foreground/5 before:bg-foreground/5 relative h-full before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border transform md:scale-90 lg:scale-100 origin-top-left">
                <div className="bg-background rounded-lg shadow-2xl shadow-foreground/10 ring-foreground/5 relative aspect-video -translate-y-6 skew-x-6 overflow-hidden border border-border/50 ring-1">
                  <Image
                    src="/hero.png"
                    alt="TaskFlow Dashboard"
                    width={1200}
                    height={800}
                    className="object-cover w-full h-full rounded-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/30 py-24">
          <div className="mx-auto w-full max-w-5xl px-6">
            <div>
              <h2 className="text-foreground text-4xl font-semibold">Effortless Task Management</h2>
              <p className="text-muted-foreground mb-12 mt-4 text-balance text-lg">Automate your tasks and workflows by connecting your favorite tools like Notion, Todoist, and more. AI-powered scheduling helps you stay on track and adapt to changing priorities.</p>
              <div className="bg-foreground/5 rounded-3xl p-6 border border-border/50">
                <Table />
              </div>
            </div>

            <div className="border-foreground/10 relative mt-16 grid gap-12 border-b pb-12 [--radius:1rem] md:grid-cols-2">
              <div>
                <h3 className="text-foreground text-xl font-semibold">Marketing Campaigns</h3>
                <p className="text-muted-foreground my-4 text-lg">Effortlessly plan and execute your marketing campaigns organized.</p>
                <Card className="aspect-video overflow-hidden px-6 pt-6 bg-muted/50 border-none shadow-none">
                  <div className="h-full w-full bg-background rounded-t-xl border border-border shadow-sm p-4 translate-y-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                      <div className="h-4 w-24 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-muted rounded"></div>
                      <div className="h-2 w-3/4 bg-muted rounded"></div>
                    </div>
                  </div>
                </Card>
              </div>
              <div>
                <h3 className="text-foreground text-xl font-semibold">AI Meeting Scheduler</h3>
                <p className="text-muted-foreground my-4 text-lg">Effortlessly book and manage your meetings. Stay on top of your schedule.</p>
                <Card className="aspect-video overflow-hidden px-6 pt-6 bg-muted/50 border-none shadow-none">
                  <div className="h-full w-full bg-background rounded-t-xl border border-border shadow-sm p-4 translate-y-2 flex flex-col items-center justify-center text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-sm font-medium">Auto-Scheduling...</div>
                  </div>
                </Card>
              </div>
            </div>

            <blockquote className="before:bg-primary relative mt-12 max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full">
              <p className="text-foreground text-lg italic">"Wow, auto-generated pages are the kind of thing that you don't even know you need until you see it. It's like an AI-native CRM."</p>
              <footer className="mt-4 flex items-center gap-2">
                <cite className="not-italic font-medium">Méschac Irung</cite>
                <span
                  aria-hidden
                  className="bg-foreground/15 h-1 w-1 rounded-full"></span>
                <span className="text-muted-foreground">Creator</span>
              </footer>
            </blockquote>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">TaskFlow</span>
          </div>
          <div>
            © 2025 TaskFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
