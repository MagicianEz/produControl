import { motion } from "framer-motion";
import { QuoteIcon } from "lucide-react";
import React from "react";
import { Card } from "@/Components/ui/Card";

function TestimonialSection() {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
            <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Tim Kami
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Tim yang membuat project ini
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <TestimonialCard
                        quote="Framer Motion has been a game-changer for our UI designs, making animations smoother and more intuitive."
                        author="Team 1"
                        role="Role 1"
                    />
                    <TestimonialCard
                        quote="Integrating Framer Motion into our workflow has simplified the animation process, making it accessible to our entire team."
                        author="Team 2"
                        role="Role 2"
                    />
                </div>
            </div>
        </motion.section>
    );
}

export default TestimonialSection;

// @ts-ignore
function TestimonialCard({ quote, author, role }) {
    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="w-[400px] flex flex-col items-center justify-center gap-4 rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
                <img
                    src="/assets/images/web.png"
                    alt="Photo"
                    className="rounded-t-lg aspect-[3/2 w-auto h-auto"
                />
                <div className="p-6">
                    <p className="font-semibold">{author}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </Card>
        </motion.div>
    );
}
