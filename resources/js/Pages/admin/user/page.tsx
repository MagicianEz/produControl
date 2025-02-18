import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { DataTable } from "@/Components/datatable/DataTableUser";
import { useState, useEffect } from "react";
// import { saveData, getData } from "@/lib/indexedDb";

export default function UserDashboard({
    appName,
    appTitle,
    nameUser,
    roleUser,
    users,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
    users: any[];
}>) {
    const [data, setData] = useState<any>([]);

    useEffect(() => {
        const dataUsers = users.map((user, index) => ({
            ...user,
            user_id: index + 1,
        }));
        setData(dataUsers);
    }, []);

    // useEffect(() => {
    //     const saveToIndexedDB = async () => {
    //         const dataUsers = users.map((user, index) => ({
    //             ...user,
    //             user_id: index + 1,
    //         }));
    //         await saveData("users", dataUsers);
    //         setData(dataUsers);
    //     };

    //     const fetchFromIndexedDB = async () => {
    //         const storedData = await getData("users");
    //         if (storedData.length > 0) {
    //             setData(storedData);
    //         } else {
    //             saveToIndexedDB();
    //         }
    //     };

    //     fetchFromIndexedDB();
    // }, [users]);

    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={"Akun"}
        >
            <Head title={"Akun"} />
            <div className="p-4">
                <h1 className="font-semibold mb-4 uppercase">{"Akun"}</h1>
                <DataTable data={data} />
            </div>
        </AdminLayout>
    );
}
