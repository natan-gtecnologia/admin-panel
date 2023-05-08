import { PropsWithChildren, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDisclosureProvider, MenuItem, Permission } from "@growth/growforce-admin-ui/contexts/LayoutDisclosure";
import { initialMenuItems } from "../utils/initialMenuItems";
import { ToastContainer } from "react-toastify";
import Head from "next/head";
import { ContentWrapper } from "./ContentWrapper";

export function MenuWrapper({ children }: PropsWithChildren) {
    const { user } = useAuth()

    const companyUser = user?.companies.map((company) => company.id)
    const matchingPermissions = user?.permissions.filter(permission => {
        const permissionCompanyIds = permission.attributes.companies.data.map((company) => company.id);
        return companyUser?.some((id) => permissionCompanyIds.includes(id));
    });

    const userPermissions = matchingPermissions?.flatMap(permission => permission.attributes.permissions) ?? [];


    const menuItems = initialMenuItems.filter((item) => {
        const permission = userPermissions.find(i => i.modules === item.id)

        return permission && (permission.read || permission.create)
    }).map(
        item => {
            return {
                ...item,
                subItems: item.subItems.filter(
                    sItem => {
                        const permission = userPermissions.find(i => i.modules === item.id)

                        if (sItem.id === `create-${item.id}` && !permission.create) {
                            return false;
                        }
                        if (sItem.id === `read-${item.id}` && !permission.read) {
                            return false;
                        }

                        return true;
                    }
                )
            }
        }
    )

    return (
        <LayoutDisclosureProvider key={menuItems.length} initialMenuItems={menuItems}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                pauseOnHover
            />

            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <ContentWrapper>
                {children}
            </ContentWrapper>
        </LayoutDisclosureProvider>
    );
}