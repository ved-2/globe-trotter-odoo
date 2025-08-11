import React from "react";
import Link from "next/link";
import { Map, Calendar, Users, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MagicBento from "@/components/Components/MagicBento/MagicBento";

const faqs = [
  {
    question: "What is GlobeTrotter?",
    answer:
      "GlobeTrotter is your all-in-one travel planning platform. From crafting personalized itineraries to managing bookings and collaborating with friends, we make your travel dreams a reality.",
  },
  {
    question: "Can I plan trips with friends?",
    answer:
      "Absolutely! Invite friends to your trip, collaborate on destinations, share budgets, and finalize plans together in real-time.",
  },
  {
    question: "Does GlobeTrotter work for solo travelers?",
    answer:
      "Yes! Whether you're going solo or in a group, GlobeTrotter tailors the planning experience to your needs.",
  },
  {
    question: "Can I track my expenses?",
    answer:
      "Yes, our built-in budget tracker helps you keep an eye on expenses so you can enjoy your trip without financial stress.",
  },
  {
    question: "Is GlobeTrotter free to use?",
    answer:
      "We offer a free version with core features. Upgrade to unlock advanced tools like AI-powered trip suggestions and premium destination guides.",
  },
];

const features = [
  {
    title: "Personalized Itineraries",
    description:
      "Plan day-by-day schedules with our easy drag-and-drop trip builder.",
    icon: Calendar,
  },
  {
    title: "Discover Destinations",
    description:
      "Get AI-powered suggestions for destinations, activities, and hidden gems.",
    icon: Map,
  },
  {
    title: "Group Collaboration",
    description:
      "Invite friends and family to contribute to your trip planning in real-time.",
    icon: Users,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="container mx-auto py-20 text-center">
        <h1 className="text-3xl sm:text-7xl lg:text-8xl font-extrabold gradient-title pb-6 flex flex-col">
          Plan Your Perfect Trip
          <span className="flex mx-auto gap-3 sm:gap-4 items-center">
            with GlobeTrotter
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Create detailed itineraries, explore user-shared guides, and manage
          your bookings seamlessly — all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/onboarding">
            <Button size="lg">
              Get Started <ChevronRight size={18} className="ml-1" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-20 px-5">
        <MagicBento
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="132, 0, 255"
        />
      </section>

      {/* ================= TRUSTED BY SECTION ================= */}
      <section className="py-20 text-center">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12">
            Trusted by Travelers Worldwide
          </h3>
          {/* Replace with travel partners or destination carousel */}
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-20 px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-20 text-center px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Plan Your Next Adventure?
          </h3>
          <p className="text-xl mb-12">
            Join travelers worldwide using GlobeTrotter to design unforgettable
            journeys.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="animate-bounce">
              Start For Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
