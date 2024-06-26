import FriendRequestsSidebarOption from "@/components/FriendRequestsSidebarOption";
import { Icon, Icons } from "@/components/Icons";
import SidebarChatList from "@/components/SidebarChatList";
import SignOutButton from "@/components/SignOutButton";
import { authOptions } from "@/lib/auth";
import { getFriendsByUserId } from "@/lib/helpers/getFriendsByUserId";
import { fetchRedis } from "@/lib/helpers/redis";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface layoutProps {
    children: ReactNode;
}

interface SidebarOption {
    id: number;
    name: string;
    href: string;
    Icon: Icon;
}

const sideBarOptions: SidebarOption[] = [
    {
        id: 1,
        name: "Add Friend",
        href: "/dashboard/add",
        Icon: "UserPlus",
    },
];

const layout: FC<layoutProps> = async ({ children }) => {
    const session = await getServerSession(authOptions);
    if (!session) notFound();

    const friends = await getFriendsByUserId(session.user.id);

    const unseenRequestCount = (
        (await fetchRedis(
            "smembers",
            `user:${session.user.id}:incoming_friend_requests`
        )) as User[]
    ).length;

    return (
        <div className="w-full h-screen flex">
            <div className="flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                <Link
                    href="/dashboard"
                    className="flex h-16 shrink-0 items-center"
                >
                    <Icons.Logo className="h-8 text-indigo-600" />
                </Link>
                {friends?.length > 0 ? (
                    <div className="text-xs font-semibold leading-6 text-gray-400">
                        Your Chats
                    </div>
                ) : null}

                <nav className="flex-col flex-1 flex">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <SidebarChatList
                                sessionId={session.user.id}
                                friends={friends}
                            />
                        </li>
                        <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">
                                Overview
                            </div>
                            <ul role="list" className="-mx-2 mt-2 space-y-1">
                                {sideBarOptions.map((option) => {
                                    const Icon = Icons[option.Icon];
                                    return (
                                        <li key={option.id}>
                                            <Link
                                                href={option.href}
                                                className="group text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                            >
                                                <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] bg-white">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="truncate">
                                                    {option.name}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                                <li>
                                    <FriendRequestsSidebarOption
                                        sessionId={session.user.id}
                                        initialUnseenRequestCount={
                                            unseenRequestCount
                                        }
                                    />
                                </li>
                            </ul>
                        </li>
                        <li className="-mx-6 mt-auto flex items-center">
                            <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                                <div className="relative h-8 w-8 bg-gray-50">
                                    <Image
                                        fill
                                        referrerPolicy="no-referrer"
                                        className="rounded-full"
                                        src={session.user.image || ""}
                                        alt="Your profile picture"
                                    />
                                </div>
                                <span className="sr-only">Your Profile</span>
                                <div className="flex flex-col">
                                    <span aria-hidden="true">
                                        {session.user.name}
                                    </span>
                                    <span
                                        className="text-xs text-zinc-400"
                                        aria-hidden="true"
                                    >
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>
                            <SignOutButton className="h-full aspect-square flex-shrink-0" />
                        </li>
                    </ul>
                </nav>
            </div>
            {children}
        </div>
    );
};

export default layout;
