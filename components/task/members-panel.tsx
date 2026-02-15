"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    X,
    Users,
    UserPlus,
    Mail,
    Shield,
    Crown,
    Loader2,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAddMember, useRemoveMember } from "@/hooks/use-boards";
import { useUser } from "@clerk/nextjs";

interface MembersPanelProps {
    boardId: string;
    members: any[];
    ownerId: string;
    onClose: () => void;
}

export function MembersPanel({
    boardId,
    members,
    ownerId,
    onClose,
}: MembersPanelProps) {
    const { user: currentUser } = useUser();
    const [email, setEmail] = useState("");
    const [addError, setAddError] = useState("");
    const addMember = useAddMember(boardId);
    const removeMember = useRemoveMember(boardId);

    const isOwner = currentUser?.id === ownerId;

    const handleAddMember = async () => {
        if (!email.trim()) return;
        setAddError("");
        try {
            await addMember.mutateAsync({ email: email.trim(), role: "member" });
            setEmail("");
        } catch (error: any) {
            setAddError(error.message || "Failed to add member");
        }
    };

    const getRoleIcon = (role: string) => {
        if (role === "owner") return <Crown className="size-3 text-amber-500" />;
        if (role === "admin") return <Shield className="size-3 text-blue-500" />;
        return null;
    };

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <h3 className="font-semibold text-sm">Board Members</h3>
                    <Badge variant="secondary" className="text-[10px]">
                        {members.length}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onClose}
                >
                    <X className="size-4" />
                </Button>
            </div>

            {/* Add Member */}
            {/* Add Member */}
            {isOwner && (
                <div className="p-4 border-b border-border space-y-3">
                    <label className="text-xs font-medium text-muted-foreground block">
                        Invite a member by email
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input
                                placeholder="colleague@example.com"
                                className="pl-8 text-xs h-8"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddMember();
                                }}
                            />
                        </div>
                        <Button
                            size="sm"
                            className="h-8 shrink-0 gap-1.5"
                            onClick={handleAddMember}
                            disabled={addMember.isPending || !email.trim()}
                        >
                            {addMember.isPending ? (
                                <Loader2 className="size-3 animate-spin" />
                            ) : (
                                <UserPlus className="size-3" />
                            )}
                            Invite
                        </Button>
                    </div>
                    {addError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                            <Shield className="size-3" />
                            {addError}
                        </p>
                    )}
                    <p className="text-[10px] text-muted-foreground opacity-80">
                        User must have already signed up for TaskFlow with this email.
                    </p>
                </div>
            )}

            {/* Members List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {members.map((member: any) => (
                    <div
                        key={member.userId}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                        <Avatar className="size-8">
                            <AvatarImage src={member.user?.avatarUrl} />
                            <AvatarFallback className="text-xs">
                                {(member.user?.name || member.user?.email || "?")
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {member.user?.name || "Unknown"}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                                {member.user?.email || member.userId}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end">
                                {getRoleIcon(member.role)}
                                <span className="text-[10px] text-muted-foreground capitalize">
                                    {member.role}
                                </span>
                            </div>
                            {isOwner && member.role !== "owner" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                        if (confirm(`Remove ${member.user?.name || "this member"}?`)) {
                                            removeMember.mutate(member.userId);
                                        }
                                    }}
                                    disabled={removeMember.isPending}
                                >
                                    {removeMember.isPending ? (
                                        <Loader2 className="size-3 animate-spin" />
                                    ) : (
                                        <Trash2 className="size-3" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
