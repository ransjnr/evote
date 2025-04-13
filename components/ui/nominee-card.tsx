"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

type NomineeCardProps = {
  nominee: {
    id: string;
    name: string;
    image?: string | null;
    description?: string | null;
    votes?: number;
  };
  eventStatus: "running" | "ended" | "upcoming" | "loading";
  votePrice: number;
  onVoteClick?: (nomineeId: string) => void;
  isVoting?: boolean;
  className?: string;
};

export const NomineeCard = ({
  nominee,
  eventStatus,
  votePrice,
  onVoteClick,
  isVoting = false,
  className = "",
}: NomineeCardProps) => {
  const handleVoteClick = () => {
    if (onVoteClick && eventStatus === "running") {
      onVoteClick(nominee.id);
    }
  };

  let buttonLabel = `Vote - ${formatCurrency(votePrice)}`;
  if (eventStatus === "ended") buttonLabel = "Voting Ended";
  else if (eventStatus === "upcoming") buttonLabel = "Coming Soon";
  else if (isVoting) buttonLabel = "Processing...";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`h-full ${className}`}
    >
      <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
        <CardHeader className="p-0 relative aspect-square overflow-hidden">
          {nominee.image ? (
            <Image
              src={nominee.image}
              alt={nominee.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xl">No Image</span>
            </div>
          )}
          {nominee.votes !== undefined && nominee.votes > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            >
              {nominee.votes} {nominee.votes === 1 ? "Vote" : "Votes"}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{nominee.name}</h3>
          {nominee.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {nominee.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            onClick={handleVoteClick}
            disabled={eventStatus !== "running" || isVoting}
            variant={eventStatus === "running" ? "default" : "outline"}
          >
            {buttonLabel}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export const NomineeCardSkeleton = () => {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-0 aspect-square relative">
        <Skeleton className="absolute inset-0" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-full mt-1" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
};
