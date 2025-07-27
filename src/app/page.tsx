"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  Gavel,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Users,
  DollarSign,
  Shield,
  Zap,
  Star,
  ChevronDown,
  Play,
  TrendingDown,
  Clock,
  Eye,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      router.push("/auctions");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex flex-col items-center space-y-16 py-8">
          <section className="max-w-4xl w-full">
            <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-full mx-auto mb-8" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </section>
          <section className="max-w-5xl w-full">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <Skeleton className="h-80 w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "End-to-end encryption with complete bid transparency",
    },
    {
      icon: Zap,
      title: "Real-time Bidding",
      description: "Live auction updates with instant notifications",
    },
    {
      icon: Users,
      title: "Global Network",
      description: "Connect with suppliers worldwide",
    },
    {
      icon: IndianRupee,
      title: "Cost Savings",
      description: "Average 25% reduction in procurement costs",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Procurement Director",
      company: "TechCorp",
      content:
        "ReverseAuction transformed our procurement process. We've saved over ₹2M this year alone.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Operations Manager",
      company: "Global Industries",
      content:
        "The platform is intuitive and the results speak for themselves. Highly recommended!",
      rating: 5,
    },
    {
      name: "Lisa Rodriguez",
      role: "Supply Chain Head",
      company: "Innovation Ltd",
      content:
        "Best reverse auction platform we've used. The transparency and savings are incredible.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Compact Hero Section with Preview Cards */}
      <section className="relative px-6 py-12 lg:py-16">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div
          className={`relative max-w-7xl mx-auto transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-6 py-3 rounded-full text-sm font-bold mb-6 border border-blue-200 shadow-lg">
                <Gavel className="h-4 w-4" />
                <span>The Future of Procurement is Here</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Reverse
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  Auction
                </span>
                <br />
                <span className="text-gray-700 text-3xl md:text-4xl lg:text-5xl">
                  Revolution
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Where sellers compete for your business, driving down costs and
                maximizing value.
                <span className="font-bold text-blue-600">
                  {" "}
                  Join 1000+ companies saving millions.
                </span>
              </p>

              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                  asChild
                >
                  <Link href="/auctions">
                    Start Saving Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 group bg-white/80 backdrop-blur-sm"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Watch Demo
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-600">₹50M+</div>
                  <div className="text-sm text-gray-600 font-semibold">
                    Client Savings
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-green-600">
                    1000+
                  </div>
                  <div className="text-sm text-gray-600 font-semibold">
                    Companies
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-600">25%</div>
                  <div className="text-sm text-gray-600 font-semibold">
                    Avg Savings
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Preview Cards */}
            <div className="space-y-6">
              {/* Live Auction Preview */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    Live Auction
                  </h3>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                    3 Active
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                    <span className="font-semibold text-gray-700">
                      Office Supplies
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-green-600">₹7,200</div>
                      <div className="text-xs text-gray-500">28% saved</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      12 bidders active
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      2h 15m left
                    </span>
                  </div>
                </div>
              </div>

              {/* Features Quick Preview */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Why Choose Us?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Secure Platform</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Real-time Updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Global Network</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Cost Savings</span>
                  </div>
                </div>
              </div>

              {/* Success Story Preview */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 shadow-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">TechCorp</div>
                    <div className="text-sm text-gray-600">
                      Saved ₹2M this year
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 italic">
                  "ReverseAuction transformed our procurement process
                  completely..."
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - More Compact */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              How
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {" "}
                It Works
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps and start saving immediately
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Post Requirements",
                description: "Define what you need and set your specifications",
                icon: Target,
                color: "from-blue-500 to-indigo-500",
              },
              {
                step: "02",
                title: "Suppliers Compete",
                description:
                  "Multiple vendors bid with progressively lower prices",
                icon: Users,
                color: "from-orange-500 to-red-500",
              },
              {
                step: "03",
                title: "You Save & Win",
                description:
                  "Select the best offer and save significantly on costs",
                icon: Award,
                color: "from-green-500 to-emerald-500",
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${item.color} text-white rounded-3xl flex items-center justify-center font-black text-xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Connection Lines */}
          <div className="hidden md:block relative -mt-32 mb-16">
            <div className="absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 via-orange-200 to-green-200"></div>
          </div>
        </div>
      </section>

      {/* Features Section - Compact Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Why Choose
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                ReverseAuction?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer border-2 ${
                  activeFeature === index
                    ? "border-blue-400 scale-105 bg-gradient-to-br from-blue-50 to-indigo-50"
                    : "border-transparent hover:border-blue-200"
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    activeFeature === index
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white scale-110"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600"
                  }`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Compact */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              What Our
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {" "}
                Clients Say
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed italic text-sm">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {testimonial.role}
                  </div>
                  <div className="text-blue-600 text-xs font-semibold">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Start Saving?
          </h2>
          <p className="text-lg mb-8 text-gray-300">
            Join thousands of companies already saving millions through
            competitive bidding
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-12 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
            asChild
          >
            <Link href="/auctions">
              Get Started Today
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
