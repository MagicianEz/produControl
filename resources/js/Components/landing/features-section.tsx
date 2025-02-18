import { motion } from "framer-motion";
import { BrushIcon, LineChartIcon, CuboidIcon, PencilIcon } from "lucide-react";
import React from "react";
import { Card } from "@/Components/ui/Card";

function FeaturesSection() {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
            <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Fitur Kami
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Fitur-fitur yang terdapat di ProduControl
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <FeatureCard
                        icon={<CuboidIcon className="h-12 w-12 text-primary" />}
                        title="Management Barang Production"
                        description="Kelola barang dalam proses produksi dengan sistem yang efisien dan terorganisir."
                    />
                    <FeatureCard
                        icon={<CuboidIcon className="h-12 w-12 text-primary" />}
                        title="Management Stock"
                        description="Pantau dan atur stok barang untuk memastikan ketersediaan dan menghindari kekurangan."
                    />
                    <FeatureCard
                        icon={<CuboidIcon className="h-12 w-12 text-primary" />}
                        title="Management Pengiriman"
                        description="Optimalkan pengiriman barang dengan fitur pelacakan dan koordinasi yang mudah."
                    />
                </div>
            </div>
        </motion.section>
    );
}

export default FeaturesSection;

// @ts-ignore
function FeatureCard({ icon, title, description }) {
    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                {icon}
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </Card>
        </motion.div>
    );
}
