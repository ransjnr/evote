"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { ThumbsUp } from "lucide-react";

type NomineeCardProps = {
  nominee: {
    id: string;
    name: string;
    image?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    votes?: number;
    code?: string;
  };
  eventStatus: "running" | "ended" | "upcoming" | "loading";
  votePrice: number;
  onVoteClick?: (nomineeId: string) => void;
  isVoting?: boolean;
  className?: string;
  hideVotes?: boolean;
  showCode?: boolean;
};

export const NomineeCard = ({
  nominee,
  eventStatus,
  votePrice,
  onVoteClick,
  isVoting = false,
  className = "",
  hideVotes = false,
  showCode = false,
}: NomineeCardProps) => {
  // Get real-time vote count from Convex
  const voteCount = useQuery(api.voting.getNomineeVotes, {
    nomineeId: nominee.id,
  });

  // Use the API vote count if available, otherwise fall back to the prop
  const displayVotes = voteCount !== undefined ? voteCount : nominee.votes;

  // Animation for fresh votes
  const [animateVote, setAnimateVote] = useState(false);

  // Track last vote count to detect changes
  const [lastVoteCount, setLastVoteCount] = useState(displayVotes);

  useEffect(() => {
    // If the vote count changes, trigger animation
    if (
      displayVotes !== undefined &&
      lastVoteCount !== undefined &&
      displayVotes > lastVoteCount
    ) {
      setAnimateVote(true);
      const timer = setTimeout(() => setAnimateVote(false), 2000);
      return () => clearTimeout(timer);
    }
    setLastVoteCount(displayVotes);
  }, [displayVotes, lastVoteCount]);

  const handleVoteClick = () => {
    if (onVoteClick && eventStatus === "running") {
      onVoteClick(nominee.id);
    }
  };

  let buttonLabel = `Vote - ${formatCurrency(votePrice)}`;
  if (eventStatus === "ended") buttonLabel = "Voting Ended";
  else if (eventStatus === "upcoming") buttonLabel = "Coming Soon";
  else if (isVoting) buttonLabel = "Processing...";

  const imageUrl = nominee.imageUrl || nominee.image;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`h-full ${className}`}
    >
      <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
        <CardHeader className="p-0 relative aspect-square overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
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
          {!hideVotes && displayVotes !== undefined && displayVotes > 0 && (
            <motion.div
              animate={animateVote ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="secondary"
                className={`absolute top-2 right-2 ${
                  animateVote
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/80"
                } backdrop-blur-sm transition-colors duration-500`}
              >
                {displayVotes} {displayVotes === 1 ? "Vote" : "Votes"}
              </Badge>
            </motion.div>
          )}
          {animateVote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="bg-primary/80 text-white p-3 rounded-full backdrop-blur-md">
                <ThumbsUp className="h-8 w-8" />
              </div>
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{nominee.name}</h3>
          {nominee.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {nominee.description}
            </p>
          )}
          {showCode && nominee.code && (
            <div className="mt-2">
              <span className="text-xs bg-primary/10 text-primary font-mono px-2 py-1 rounded inline-block">
                Code: {nominee.code}
              </span>
            </div>
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
