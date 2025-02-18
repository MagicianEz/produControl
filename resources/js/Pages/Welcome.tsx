import { Head } from "@inertiajs/react";
import SiteNav from "@/Components/landing/site-nav";
import HeroSection from "@/Components/landing/hero-section";
import FeaturesSection from "@/Components/landing/features-section";
import IntegrationSection from "@/Components/landing/integration-section";
import TestimonialSection from "@/Components/landing/testimonial-section";
import SiteFooter from "@/Components/landing/site-footer";

export default function Welcome({ auth }: { auth: any }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex flex-col min-h-screen bg-background">
                <SiteNav auth={auth} />
                <main className="flex-1">
                    <HeroSection />
                    <FeaturesSection />
                    <IntegrationSection />
                    <TestimonialSection />
                </main>
                <SiteFooter />
            </div>
        </>
    );
}
