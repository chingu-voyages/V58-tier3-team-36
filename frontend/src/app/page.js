import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Map, List, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-10">
      
      {/* 1. HERO SECTION (12 Columns) */}
      <Card className="bg-white p-8 sm:p-12 shadow-2xl border-2 border-brand-blue/50">
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center text-brand-blue mb-2">
            <Users className="w-8 h-8 mr-3" />
            <CardTitle className="text-4xl font-extrabold text-brand-textBlack">
              Global Chingu Demographics
            </CardTitle>
          </div>
          <CardDescription className="text-xl text-chingutextgrey">
            Explore the geographical distribution and profile breakdown of Chingu Voyage members worldwide.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          
          {/* Call to Action - Spans 12 columns on all sizes */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/map" passHref>
              <Button size="lg" className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg py-6 text-lg font-bold transition-all transform hover:scale-[1.01]">
                <Map className="w-5 h-5 mr-2" /> View Interactive Map
              </Button>
            </Link>
            <Link href="/list" passHref>
              <Button size="lg" variant="secondary" className="w-full bg-brand-mint hover:bg-brand-mint/80 text-brand-textBlack shadow-lg py-6 text-lg font-bold transition-all transform hover:scale-[1.01]">
                <List className="w-5 h-5 mr-2" /> View Filterable List
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. INFORMATIONAL CARDS SECTION */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Card 1: Map Explanation (Spans 12 columns on mobile, 6 on desktop) */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="h-full bg-white shadow-lg border border-brand-mint/50">
            <CardHeader>
              <div className="flex items-center text-brand-blue">
                <Map className="w-5 h-5 mr-2" />
                <CardTitle>Map View</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-chingutextgrey">
              The map provides a visual overview with pins representing country centroids. Each pin displays the count of Chingus originating from that country. Filters are applied in real-time to adjust the displayed counts.
            </CardContent>
          </Card>
        </div>

        {/* Card 2: List Explanation (Spans 12 columns on mobile, 6 on desktop) */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="h-full bg-white shadow-lg border border-brand-mint/50">
            <CardHeader>
              <div className="flex items-center text-brand-blue">
                <List className="w-5 h-5 mr-2" />
                <CardTitle>List View & Filtering</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-chingutextgrey">
              The List view presents raw demographic data in a clean, paginated table. Utilize the shared search component to filter records by Role Type, Voyage Tier, Year of Joining, and other criteria.
            </CardContent>
          </Card>
        </div>
        
        {/* Card 3: Technology Stack (Full 12 columns on desktop) */}
        <div className="col-span-12">
           <Card className="bg-brand-mint/40 shadow-inner border border-brand-mint h-full">
            <CardHeader>
              <div className="flex items-center text-brand-textBlack">
                <TrendingUp className="w-5 h-5 mr-2" />
                <CardTitle>Tech Stack & Future Goals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-chingutextblack/90">
              Built on Next.js, Express, and MongoDB, this app is designed for scalability. Future features include Google Authentication (complete) and an integrated Gemini AI Chatbot.
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}