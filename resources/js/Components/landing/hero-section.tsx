"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";

function HeroSection() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full py-12 md:py-24 lg:py-32"
        >
            <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl ">
                        ProduControl
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Management production, stock, dan pengirimanmu...
                    </p>
                </div>
            </div>
            <img
                src="/assets/images/web.png"
                width="1200"
                height="100"
                className="flex mx-auto mt-20 border rounded-lg lg:block shadow-sm"
            />
        </motion.section>
    );
}

export default HeroSection;
