import { motion } from "framer-motion";
import React from "react";

function IntegrationSection() {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full py-12 md:py-24 lg:py-32"
        >
            <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Teknologi Yang Digunakan
                    </h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Teknologi yang kami gunakan dalam membangun web
                        ProduControl
                    </p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    <IntegrationLogo
                        name="Laravel"
                        logo="https://www.vectorlogo.zone/logos/laravel/laravel-icon.svg"
                    />
                    <IntegrationLogo
                        name="PHP"
                        logo="https://www.vectorlogo.zone/logos/php/php-icon.svg"
                    />
                    <IntegrationLogo
                        name="React"
                        logo="https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg"
                    />
                    <IntegrationLogo
                        name="JavaScript"
                        logo="https://www.vectorlogo.zone/logos/javascript/javascript-icon.svg"
                    />
                    <IntegrationLogo
                        name="MySQL"
                        logo="https://www.vectorlogo.zone/logos/mysql/mysql-icon.svg"
                    />
                </div>
            </div>
        </motion.section>
    );
}

export default IntegrationSection;

// @ts-ignore
function IntegrationLogo({ name, logo }) {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center"
        >
            <img
                src={logo || "/placeholder.svg"}
                width="200"
                height="50"
                alt={name}
                className="aspect-[2/1] overflow-hidden rounded-lg object-contain object-center cursor-pointer"
            />
        </motion.div>
    );
}
