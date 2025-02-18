import { PageProps } from "@/types";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Edit({
    appName,
    appTitle,
    nameUser,
    roleUser,
}: PageProps<{
    appName: string;
    appTitle: string;
    nameUser: string;
    roleUser: string;
}>) {
    return (
        <AdminLayout
            appName={appName}
            title={appTitle}
            name={nameUser}
            role={roleUser}
            breadcumb1={"Aplikasi"}
            breadcumb2={appTitle}
        >
            <div className="p-4">
                <div className="mx-auto max-w-[112rem] grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-4 sm:rounded-lg sm:p-8 border">
                        <UpdateProfileInformationForm className="max-w-xl" />
                    </div>
                    <div className="bg-white p-4 sm:rounded-lg sm:p-8 border">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                    <div className="bg-white p-4 sm:rounded-lg sm:p-8 border">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
